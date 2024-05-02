import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response, Request } from 'express';
import { CustomResponseDto } from 'src/custom-response/custom-response.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const user = await this.authService.authorize(loginDto);

    const payload = { email: user.email, name: user.name };

    const accessToken = this.authService.generateAccessToken(payload);

    const refreshToken = this.authService.generateRefreshToken(payload);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.json({ accessToken, user });
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res() res: Response) {
    const user = await this.authService.register(registerDto);
    const accessToken = this.authService.generateAccessToken({
      email: user.email,
      name: user.name,
    });
    const refreshToken = this.authService.generateRefreshToken({
      email: user.email,
      name: user.name,
    });
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return new CustomResponseDto(201, 'User created successfully', {
      accessToken,
      user,
    });
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const decoded = this.authService.verifyRefreshToken(refreshToken);
      const accessToken = this.authService.generateAccessToken({
        name: decoded.name,
        email: decoded.email,
      });
      return res.json({ accessToken });
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
    return new CustomResponseDto(200, 'Logged out successfully', true);
  }
}
