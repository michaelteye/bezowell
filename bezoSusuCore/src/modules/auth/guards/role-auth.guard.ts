import { AppRequestContext } from '../../../utils/app-request.context';
import { getAppContextALS } from '../../../utils/context';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuthUserRole } from '../../../modules/auth/types/auth-user.roles';
import { HttpException } from '@nestjs/common';

export const RoleAuth = (...roles: AuthUserRole[]) =>
  SetMetadata('allowedRoles', roles);
@Injectable()
export class RoleAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const allowedRoles = this.reflector.get<AuthUserRole[]>(
      'allowedRoles',
      context.getHandler(),
    );
    if (!allowedRoles || allowedRoles.length === 0) {
      throw new HttpException('Unauthorized', 401);
    }
    const ctx = getAppContextALS<AppRequestContext>();
    for (const role of allowedRoles) {
      if (ctx.rolesMap[role]) {
        return true;
      }
    }
    return false;
  }
}
