import { IdentityInterface } from './identity.interface';

export const IdentityProviderServiceToken = 'auth:IdentityProviderService';

export interface IdentityProviderServiceInterface {
  createIdentity(identity: IdentityInterface): IdentityInterface;
  saveIdentity(
    identity: IdentityInterface,
  ): Promise<IdentityInterface>;
  retrieveIdentityByPhone(phone: string): Promise<IdentityInterface>;

  retrieveIdentityByEmail(email: string): Promise<IdentityInterface>;
}
