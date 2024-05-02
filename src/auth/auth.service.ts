import { RegisterDto } from './dto/register.dto';
import {
  HttpException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/entities/user.entity';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,

    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: { email: string; name: string }): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION'),
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  generateRefreshToken(payload: { email: string; name: string }): string {
    return this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION'),
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  storeRefreshTokenInCookie(res: Response, refreshToken: string) {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
    });
  }

  verifyRefreshToken(refreshToken: string): any {
    try {
      const decoded = this.jwtService.verify(refreshToken);
      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: any) {
    const user = await this.usersService.findByEmail(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      name: user.name,
      email: user.email,
      roles: user.roles,
      permissions: user.roles.reduce(
        (acc, role) => [...acc, ...role.permissions],
        [],
      ),
    };
  }

  async authorize(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new HttpException('Email is not registered', 404);
    }

    if (!bcrypt.compareSync(loginDto.password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.findByEmail(registerDto.email);
    if (user) {
      throw new HttpException('Email is already registered', 409);
    }

    const hashedPassword = bcrypt.hashSync(registerDto.password, 10);
    const newUser = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return newUser;
  }

  async parseUserByToken(token: string) {
    try {
      if (!token) return null;

      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
      const user = await this.usersService.findByEmail(decoded.email);

      return user;
    } catch (error) {
      return null;
    }
  }
}
