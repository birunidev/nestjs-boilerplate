import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { In, Not, Repository } from 'typeorm';
import { Permission } from 'src/permissions/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    const foundRole = await this.rolesRepository.findOneBy({
      name: createRoleDto.name,
    });
    if (foundRole) {
      throw new ConflictException('Role already exists');
    }
    const role = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(role);
  }

  async findAll() {
    return await this.rolesRepository.find({
      relations: ['permissions'],
    });
  }

  async findOne(id: number) {
    const role = await this.rolesRepository.findOne({
      where: {
        id,
      },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    const foundName = await this.rolesRepository.findOne({
      where: {
        name: updateRoleDto.name,
        id: Not(id),
      },
    });

    if (foundName) {
      throw new ConflictException('Role already exists');
    }

    const permissions = await this.permissionRepository.find({
      where: {
        id: In(updateRoleDto.permissions),
      },
    });
    if (permissions.length !== updateRoleDto.permissions.length) {
      throw new BadRequestException('Some permissions not found');
    }

    return await this.rolesRepository.save({
      ...role,
      ...updateRoleDto,
      permissions,
    });
  }

  async remove(id: number) {
    const role = await this.rolesRepository.findOneBy({ id });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.rolesRepository.remove(role);
  }
}
