import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { AccountTypeEntity } from 'src/modules/account/entities/account-type.entity';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { EntityManager } from 'typeorm';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { generateCode } from '../../../utils/shared';
import { UserEntity } from '../../main/entities/user.entity';

@Console()
export class CreateLedgerAccountCommand {
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {}

  @Command({
    command: 'create:ledger',
  })
  async execute(opts?: any) {
    try {
      return await this._execute(opts);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async _execute(opts?: any) {
    const existingAccount = await this.em.findOne(AccountEntity, {
      where: { name: 'Ledger' },
    });
    if (!existingAccount) {
      const account = new AccountEntity();
      account.name = 'Ledger';
      account.accountTypeId = await this.getAccountTypeId();
      account.accountNumber = ""+Number(generateCode(10));
      account.balance = 0;
      account.userId = await this.getAdminUserId();
      account.walletId = await this.getWalletId();
      await this.em.save(account);
    }
  }

  async getWalletId() {
    const wallet = await this.em.findOne(WalletTypeEntity, {
      where: { name: 'Local' },
    });
    if (wallet) return wallet.id;
    return null;
  }

  async getAccountTypeId(type?: string) {
    const accountType = await this.em.findOne(AccountTypeEntity, {
      where: { name: type ?? 'Flexi Save' },
    });
    return accountType.id;
  }

  async getAdminUserId() {
    const user = await this.em.findOne(UserEntity, {
      where: { userName: 'Admin10' },
    });

    if (user) return user.id;
  }
}
