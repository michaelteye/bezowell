import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { IdentityProviderServiceInterface } from '../interfaces/identity-provider.service.interface';
import { IdentityInterface } from '../interfaces/identity.interface';

@Injectable()
export class IdentityProviderService implements IdentityProviderServiceInterface
{
  constructor(private repo: Repository<IdentityInterface>) {}
  createIdentity(identity: IdentityInterface): IdentityInterface {
     return this.repo.create(identity);
  }

  async saveIdentity(identity: IdentityInterface): Promise<IdentityInterface> {
    return this.repo.save(identity);
  }

  retrieveIdentityByPhone(phone: string): Promise<IdentityInterface> {
    return this.repo.findOne({
      where: { phone: phone }
    });
  }

  retrieveIdentityByEmail(email: string): Promise<IdentityInterface> {
    return this.repo.findOne({
      where: { email: email }
    });
  }

}
