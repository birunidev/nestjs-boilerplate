import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly permissions: string[]) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    user.permissions = user.permissions.map(
      (permission: Permission) => permission.name,
    );

    if (!user) {
      return false;
    }

    const hasPermission = () =>
      this.permissions.some((permission) =>
        user.permissions.includes(permission),
      );

    return hasPermission();
  }
}
