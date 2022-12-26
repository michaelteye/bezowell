import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { JwtManagerService } from 'src/modules/auth/services/jwt-manager.service';
import { PasswordEncoderService } from 'src/modules/auth/services/password-encorder.service';

import { UserEntity } from 'src/modules/main/entities/user.entity';

import { EntityManager } from 'typeorm';

import { ErrorEntity } from '../entitites/error.entity';
import { GoalTypeEntity } from '../../savings-goal/entities/goal-type.entity';
import { TRANSACTION_TYPE } from '../../enums/transaction-type.enum';
import { TRANSACTION_STATUS } from '../../enums/transaction.status';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';
import { AccountEntity } from '../../account/entities/account.entity';
import {
  AccountTransactionEntity,
} from '../../transactions/entities/account-transaction.entity';
import { AccountTypeEntity } from 'src/modules/account/entities/account-type.entity';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { generateCode } from 'src/utils/shared';

@Console()
export class MigrateAccountTransactionCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    private passwordHash: PasswordEncoderService,
    private readonly jwtManager: JwtManagerService,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:accountTransactions',
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
    console.log('Migrating Account Transactions ...');
    await this.migrateAccountTransactions();
    console.log('Completed !!...');
  }

  // load account type

  async getAccountTransactions() {
    const transactions = await this.db
      .collection('transactions')
      .aggregate()
      .lookup({
        from: 'account',
        localField: 'account_id',
        foreignField: '_id',
        as: 'account',
      })
      .lookup({
        from: 'account_type',
        localField: 'account.account_type_id',
        foreignField: '_id',
        as: 'account_type',
      })
      .toArray();
    return transactions;
  }

  async migrateAccountTransactions() {
    const userTransactions = await this.getAccountTransactions();

    // console.log('get user transactions', userTransactions);

    const chunkSize = 1000;
    for (let i = 0; i < userTransactions.length; i += chunkSize) {
      const chunk = userTransactions.slice(i, i + chunkSize);
      await Promise.all([this.createAccountTransactions(chunk)]);
    }
  }

  async createAccountTransactions(transactionData: any[]) {
    for (const transaction of transactionData) {
      try {
        const newTransaction = new AccountTransactionEntity();
        if (!(await this.ifRefExist(transaction.refNo))) {
          const status = this.getTransactionStatus(transaction.responseMessage);
          if (status === TRANSACTION_STATUS.SUCCESS) {
            newTransaction.transactionStatus = status;
            const trId = await this.getTransactionId(transaction.refNo);
            if (trId) newTransaction.transactionId = "" + trId;
            newTransaction.referenceId = transaction.refNo;
            newTransaction.phone =
              transaction.phoneNumber || transaction.msisdn;
            newTransaction.amount = transaction.amount;
            newTransaction.transactionType = await this.getTransactionType(
              transaction.transaction_type || transaction.transactionType,
            );
            if (this.isValidDate(transaction.createdAt))
              newTransaction.createdAt = new Date(transaction.createdAt);
            if (transaction.account_id) {
              const accountId = await this.getUserAccountId(
                transaction,
                transaction.account[0],
              );
              newTransaction.accountId = accountId
                ? accountId
                : (
                  await this.createNewAccount({
                    account: transaction.account[0],
                    account_type: transaction.account_type[0],
                  })
                ).id;
              //return 0;
            } else {
              // get user account id from account table;
              const accountId = await this.getUserAccountId(transaction);
              if (accountId) {
                newTransaction.accountId = accountId;
              }
            }
            if (transaction.oldBalance)
              newTransaction.initialBalance = Number(transaction.oldBalance);

            if (transaction.expectedBalance)
              newTransaction.currentBalance = Number(
                transaction.expectedBalance,
              );

            newTransaction.transactionStatus = TRANSACTION_STATUS.SUCCESS;
            if (transaction.responseMessage)
              newTransaction.responseMessage = transaction.responseMessage;

            //('transactionToSave', newTransaction);

            await this.em.save(newTransaction);
          }
        }
      } catch (error: any) {
        // console.log(error);
        // return 0;
        await this.storeErrorData(
          {
            data: transaction,
            error,
          },
          'account_transaction',
        );
      }
    }
  }

  async saveGoalType(data: GoalTypeEntity) {
    await this.em
      .findOne(GoalTypeEntity, {
        where: { name: data.name },
      })
      .then(async (goal: any) => {
        if (!goal) {
          await this.em.save(data);
        }
      });
  }

  async storeErrorData(data: any, errorType: string) {
    const errorData = new ErrorEntity();
    errorData.data = data.data;
    errorData.migrationType = errorType;
    if (data.error.detail) errorData.detail = data.error.detail;
    if (data.error.table) errorData.table = data.error.table;
    if (data.error.query) errorData.query = data.error.query;
    await this.em.save(errorData);
  }

  async getUserId(id: string) {
    const user = await this.em.findOne(UserEntity, {
      where: { user_id: id },
    });
    if (user) return user.id;
    return null;
  }

  async isValidDate(date: string) {
    const timestamp = Date.parse(date);

    if (isNaN(timestamp) == false) {
      return new Date(timestamp);
    }
    return null;
  }

  getTransactionType(type: string): TRANSACTION_TYPE {
    const stringType = type.toLowerCase();
    if (stringType.includes('debit')) return TRANSACTION_TYPE.CREDIT;
    if (stringType.includes('credit')) return TRANSACTION_TYPE.DEBIT;
    return TRANSACTION_TYPE.NOT_SPECIFIED;
  }

  getTransactionStatus(message?: string): TRANSACTION_STATUS {
    if (!message) return TRANSACTION_STATUS.FAILED;
    const formatMessage = message.toLowerCase();
    if (
      formatMessage.includes('successfully') ||
      formatMessage.includes('success')
    )
      return TRANSACTION_STATUS.SUCCESS;
    return TRANSACTION_STATUS.FAILED;
  }

  transactionIsInterest(message: string) {
    if (message.includes('Interest')) return true;
    return false;
  }

  async getTransactionId(ref: string) {
    const transaction = await this.em.findOne(TransactionEntity, {
      where: { transactionId: ref },
    });
    if (transaction) return transaction.id;
    return false;
  }

  async ifRefExist(ref: string) {
    return await this.em.findOne(AccountTransactionEntity, {
      where: { referenceId: ref },
    });
  }

  async getUserAccountId(transaction: any, account?: any): Promise<any> {
    //const userId = transaction.user_id;
    //const user = await this.getUserId(userId);
    // if (user) {
    //   const account = await this.em.findOne(AccountEntity, {
    //     where: { userId: user },
    //   });
    //   if (account) return account.id;
    //   return false;
    // }
    if (!transaction.account_id) {
      const userId = transaction.user_id;
      const user = await this.getUserId(userId);
      if (user) {
        const account = await this.em.findOne(AccountEntity, {
          where: { userId: user },
        });
        if (account) return account.id;
        return false;
      }
      return false;
    }
    // console.log('userAccountNumber', account.accountNumber);
    const userAccount = await this.em.findOne(AccountEntity, {
      where: { accountNumber: account.accountNumber },
    });
    // console.log('userAccount', userAccount);
    return userAccount.id;
  }

  async createNewAccount(data: {
    account?: any;
    account_type?: any;
  }): Promise<AccountEntity> {
    const accountData = data.account;
    const accountType = data.account_type;
    const userId = accountData.user_id;
    const goalName = accountType.name;

    const account = new AccountEntity();

    account.name = goalName;

    if (accountData) {
      const account_type =
        accountType.name === 'Primary' ? 'Primary' : 'Flexi Save';
      account.accountTypeId = await this.getAccountTypeId(account_type);
      account.accountNumber = this.getAccountNumber(
        Number(accountData.accountNumber),
      );
      account.balance = Number(accountData.balance);
      account.userId = await this.getUserId(userId);
      account.walletId = await this.getWalletId();
      return account;
    }

    account.name = goalName ? goalName : 'Default Account';
    account.accountTypeId = await this.getAccountTypeId('Primary');
    account.accountNumber = this.getAccountNumber(0); // generate default account number;
    account.balance = 0;
    account.userId = await this.getUserId(userId);
    account.walletId = await this.getWalletId();

    if (accountType.name !== 'Primary') {
      console.log('account type name', accountType.name);
      // create savings goal
    }
    return await this.em.save(account);
  }



  async getAccountTypeId(type?: string) {
    const accountType = await this.em.findOne(AccountTypeEntity, {
      where: { name: type ?? 'Felix Save' },
    });
    return accountType.id;
  }

  async getWalletId() {
    const wallet = await this.em.findOne(WalletTypeEntity, {
      where: { name: 'Local' },
    });
    if (wallet) return wallet.id;
    return null;
  }

  async getGoalTypeId(name: string) {
    const goalType = await this.em.findOne(GoalTypeEntity, {
      where: { name },
    });
    if (goalType) return goalType.id;
    return null;
  }

  getAccountNumber(acc: number) {
    if (acc === 0) return "" + Number(generateCode(10));
    return "" + acc;
  }
}
