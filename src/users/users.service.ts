import {
  BadRequestException,
  HttpException,
  Injectable,
  Param,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const user = await this.usersRepository.findOneBy({
        email: createUserDto.email,
      });
      if (user) throw new HttpException('Email is already registered', 400);

      return await this.usersRepository.save({
        ...createUserDto,
        password: bcrypt.hashSync(createUserDto.password, 10),
      });
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
      relations: ['roles', 'roles.permissions'],
    });
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['roles', 'roles.permissions'],
    });
    if (!user) throw new HttpException('User not found', 404);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new HttpException('User not found', 404);

    // validate email if it is already taken
    if (updateUserDto.email) {
      const user = await this.usersRepository.findOne({
        where: { email: updateUserDto.email, id: Not(id) },
      });
      if (user) throw new HttpException('Email is already taken', 400);
    }

    let password = user.password;
    if (updateUserDto.password) {
      password = bcrypt.hashSync(updateUserDto.password, 10);
    }

    const roles = await this.rolesRepository.find({
      where: {
        id: In(updateUserDto.roles),
      },
    });
    if (roles.length !== updateUserDto.roles.length) {
      throw new BadRequestException('Some Roles not found');
    }

    return await this.usersRepository.save({
      ...user,
      ...updateUserDto,
      password,
      roles,
    });
  }

  async remove(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new HttpException('User not found', 404);

    return await this.usersRepository.remove(user);
  }
}
