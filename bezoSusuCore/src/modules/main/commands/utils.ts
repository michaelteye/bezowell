import { AuthUserEntity } from '../../../../src/modules/auth/entities/auth-user.entity';
import { UserEntity } from '../entities/user.entity';

export function tabulateAuthUsers(authUsers: AuthUserEntity[]) {
  const mapped = authUsers.map((a) => ({
    firstName: a?.user?.firstName ?? 'admin',
    email: a?.email,
    // apiKey: a?.apiKeyIdentity?.apiKey,
  }));
  console.table(mapped);
}

export function tabulateUsers(entities: UserEntity[]) {
  const mapped = entities.map((a) => ({
    name: a?.firstName ?? 'user',
    email: a?.authUser?.email,
    phone: a?.authUser?.phone,
  }));
  console.table(mapped);
}
