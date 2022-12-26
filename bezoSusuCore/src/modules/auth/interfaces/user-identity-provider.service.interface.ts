import { UserInterface } from './user.interface';
import { BaseIdentityInterface } from './base-identity.interface';

export const UserProviderServiceToken = 'auth:UserProviderServiceInterface';

export interface UserProviderServiceInterface<
  T extends UserInterface = UserInterface,
> {
  retrieveUser(identity: BaseIdentityInterface): Promise<T>;
}
