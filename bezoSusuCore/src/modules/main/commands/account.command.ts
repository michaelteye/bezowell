import { PasswordEncoderService } from '../../../modules/auth/services/password-encorder.service';
import { EntityManager } from 'typeorm';
import { Command, Console } from 'nestjs-console';
import { AccountTypeEntity } from '../../account/entities/account-type.entity';
import { WalletTypeEntity } from '../../wallet/entities/wallet.entity';

@Console()
export class CreateAccountCommand {
  constructor(
    private em: EntityManager,
    private passwordEncoder: PasswordEncoderService,
  ) {}

  @Command({
    command: 'create:account',
  })
  async execute() {
    try {
      console.log('called');
      return await this._execute();
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async _execute() {
    const accountType = new AccountTypeEntity();
    accountType.name = 'Wallet';
    const wallet = new WalletTypeEntity();
    wallet.name = 'Primary';
    const saved = await Promise.all([
      this.em.save(accountType),
      this.em.save(wallet),
    ]);
    console.log(saved);
  }
}
