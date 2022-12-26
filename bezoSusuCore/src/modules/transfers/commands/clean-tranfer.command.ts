import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { DeleteResult, EntityManager } from 'typeorm';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import {
  AccountTransactionEntity,
} from '../../transactions/entities/account-transaction.entity';

@Console()
export class CleanTransferCommand {
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {}

  @Command({
    command: 'clean:transfer',
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
    const debitAccount = await this.em.findOne(AccountEntity, {
      where: { name: 'Ledger' },
    });

    //console.log('ledgerAccount', debitAccount);

    const transactions = await this.em.find(TransactionEntity, {
      where: { transactionType: TRANSACTION_TYPE.ADMIN_TRANSFER },
    });

    // delete account transaction
    for (const transaction of transactions) {
      await this.deleteAccountTransaction(transaction.transactionId);
    }

    for (const transaction of transactions) {
      await this.createTransactionHistory(debitAccount, transaction);
    }

    // create transaction history
  }

  async createTransactionHistory(
    debitAccount: AccountEntity,
    transaction: TransactionEntity,
  ): Promise<void> {
    const creditAccount = await this.getAccount(transaction.accountId);
    // await this.transactionService.transactionHistory(
    //   creditAccount,
    //   debitAccount,
    //   transaction.amount,
    //   transaction.naration,
    //   TRANSACTION_TYPE.ADMIN_TRANSFER,
    //   transaction.transactionId,
    // );
  }

  async getAccount(accountId: string): Promise<AccountEntity> {
    const account = await this.em.findOne(AccountEntity, {
      where: { id: accountId },
    });
    return account;
  }

  async deleteAccountTransaction(
    reference: string,
  ): Promise<DeleteResult | any> {
    const deleted = await this.em.delete(AccountTransactionEntity, {
      referenceId: reference,
    });
    console.log('deleted', deleted);
  }
}
