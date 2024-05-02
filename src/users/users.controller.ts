import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomResponseDto } from 'src/custom-response/custom-response.dto';
import * as bcrypt from 'bcrypt';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from 'src/permissions/permissions.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createUserDto: CreateUserDto) {
    const data = await this.usersService.create(createUserDto);
    return new CustomResponseDto(201, 'User created', data);
  }

  @Get()
  @UseGuards(JwtAuthGuard, new PermissionsGuard(['find-all-user']))
  async findAll() {
    const data = await this.usersService.findAll();
    return new CustomResponseDto(200, 'Fetched successfully', data);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, new PermissionsGuard(['find-user']))
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(+id);
    return new CustomResponseDto(200, 'Fetched successfully', data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }
}
