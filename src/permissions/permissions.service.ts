import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    const foundPermission = await this.permissionsRepository.findOneBy({
      name: createPermissionDto.name,
    });

    if (foundPermission) {
      throw new ConflictException('Permission already exists');
    }

    const permission = this.permissionsRepository.create(createPermissionDto);
    return await this.permissionsRepository.save(permission);
  }

  async findAll() {
    return await this.permissionsRepository.find();
  }

  async findOne(id: number) {
    const permission = await this.permissionsRepository.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.permissionsRepository.findOneBy({ id });

    if (!permission) {
      throw new ConflictException('Permission not found');
    }
    const foundPermission = await this.permissionsRepository.findOneBy({
      name: updatePermissionDto.name,
      id: Not(id),
    });

    if (foundPermission) {
      throw new ConflictException('Permission already exists');
    }

    return await this.permissionsRepository.save({
      ...permission,
      ...updatePermissionDto,
    });
  }

  async remove(id: number) {
    const permission = await this.permissionsRepository.findOneBy({ id });

    if (!permission) {
      throw new ConflictException('Permission not found');
    }

    return await this.permissionsRepository.remove(permission);
  }
}
