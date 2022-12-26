import { UserEntity } from 'src/modules/main/entities/user.entity';
import { AuthUserEntity } from '../entities/auth-user.entity';

export interface BaseIdentityInterface {
  id: string;
  user?: AuthUserEntity;
  readonly userId: string;
}
