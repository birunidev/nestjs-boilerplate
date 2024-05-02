import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CustomResponseDto } from 'src/custom-response/custom-response.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  async findAll() {
    const permissions = await this.permissionsService.findAll();
    return new CustomResponseDto(
      200,
      'Permissions retrieved successfully',
      permissions,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const permission = await this.permissionsService.findOne(+id);
    return new CustomResponseDto(
      200,
      'Permission retrieved successfully',
      permission,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
