import { UserEntity } from 'src/modules/main/entities/user.entity';
import { AuthUserEntity } from '../../../../src/modules/auth/entities/auth-user.entity';

export function tabulateAuthUsers(authUsers: AuthUserEntity[]) {
  const mapped = authUsers.map((a) => ({
    firstName: a?.user?.firstName ?? 'admin',
    email: a?.email,
    userName: a?.user.userName,
    // apiKey: a?.apiKeyIdentity?.apiKey,
  }));
  console.table(mapped);
}

export function tabulateUsers(entities: UserEntity[]) {
  const mapped = entities.map((a) => ({
    name: a?.firstName ?? 'user',
    email: a?.authUser?.email,
  }));
  console.table(mapped);
}
