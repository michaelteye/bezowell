
import { RequestContext } from '@medibloc/nestjs-request-context';
import { AuthUserEntity } from '../../src/modules/auth/entities/auth-user.entity';
import { AuthUserRole } from '../../src/modules/auth/types/auth-user.roles';

export class AppRequestContext extends RequestContext {
  authUser: AuthUserEntity;
  rolesMap: Partial<Record<AuthUserRole, boolean>>;
  locale: string;
}
