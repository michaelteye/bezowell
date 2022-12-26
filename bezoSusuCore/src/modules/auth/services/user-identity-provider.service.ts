import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { BaseIdentityInterface } from '../interfaces/base-identity.interface';
import { UserProviderServiceInterface } from '../interfaces/user-identity-provider.service.interface';
import { UserInterface } from '../interfaces/user.interface';

@Injectable()
export class UserIdentityProviderService
  implements UserProviderServiceInterface
{
  constructor(private repo: Repository<UserInterface>) {}

  async saveIdentity(identity: UserInterface): Promise<UserInterface> {
    return this.repo.save(identity);
  }

  retrieveUser(identity: BaseIdentityInterface): Promise<UserInterface> {
    return this.repo.findOne({
      where: { id: identity.userId }
    });
  }


}
