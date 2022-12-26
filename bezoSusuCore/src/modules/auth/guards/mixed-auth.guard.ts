import { AppRequestContext } from '../../../utils/app-request.context';
import { getAppContextALS } from '../../../utils/context';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// prettier-ignore
const allowedAuthTypes = [
  'jwt',
];

@Injectable()
export class MixedAuthGuard
  extends AuthGuard(allowedAuthTypes)
  implements CanActivate {
  private logger = new Logger('Security');
  getRequest(context: ExecutionContext) {
    const type = context.getType();
    if (type === 'http') {
      const ctx = context.switchToHttp();
      return ctx.getRequest();
    } else {
      throw new Error('Unsupported execution type');
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const res = (await super.canActivate(context)) as boolean; // AuthGuard returns a Promise only
    if (!res) {
      return false;
    }
    const req = this.getRequest(context);
    const ctx = getAppContextALS<AppRequestContext>();
    ctx.authUser = req.user;
    ctx.rolesMap = {};
    for (const role of ctx.authUser.roles) {
      ctx.rolesMap[role] = true;
    }
    this.logger.debug({
      msg: 'Retrieved user data',
      context: {
        id: ctx.authUser?.id,
        roles: ctx.authUser?.roles,
        locale: ctx.locale,
      },
    });
    return res;
  }
}
