import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { DataSource, EntityManager } from 'typeorm';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { AccountTransactionEntity } from 'src/modules/transactions/entities/account-transaction.entity';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';

@Console()
export class MigrateStaffBalanceCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:staffbalance',
    options: [
      {
        flags: '--type <type>',
        required: false,
      },
    ],
  })
  async execute(opts?: any) {
    let revampDataSource = this.getRevampDataSource();
    let authUsers = await this.getCurrentSystemStaffUsers();
    let migratedUserTransactionHistory = [];
    for (let user of authUsers) {
      let accounts = await this.getUserAccounts(user.userId);
      console.log(`No of user accounts found for  phone:${user.phone} userId:${user.userId} is ${accounts.length}`)
      for (let account of accounts) {
        let revampAcct = await this.getAccountFromRevamp(revampDataSource, account.accountNumber);
        if (revampAcct.length) {
          console.log(`The no of revamp accts for user  phone:${user.phone} userId:${user.userId} is ${revampAcct.length}`)
          let currentBalance = account.balance;
          console.log(`Current balance for user  phone:${user.phone} userId:${user.userId} is ${currentBalance}`);
          let revamBalance = revampAcct[0].balance;
          console.log(`Revamp balance for user  phone:${user.phone} userId:${user.userId} is ${revamBalance}`)
          account.balance = revamBalance;
          console.log('Revamp Balance is >>' + account.balance);
          let accountTransactions = await this.getAccountTransactions(account.id);
          if (accountTransactions.length > 0) {
            console.log(`The number of accountTransactions for user phone:${user.phone} userId:${user.userId} is ${accountTransactions.length}`)
            console.log('Staff did transactions on new system >>', accountTransactions.length);
            for (let transaction of accountTransactions) {
              if (transaction.transactionType == TRANSACTION_TYPE.CREDIT) {
                account.balance = (Number(account.balance) + Number(transaction.amount));
              } else if (transaction.transactionType == TRANSACTION_TYPE.DEBIT) {
                account.balance = (Number(account.balance) - Number(transaction.amount));
              }
            }
          }
          console.log('Final Balance is >>' + account.balance);
          let userIdToGetHistory = revampAcct[0].userId;
          if (migratedUserTransactionHistory.indexOf(userIdToGetHistory) > -1) {
            let history = await this.getTranscationHistoryFromRevamp(revampDataSource, userIdToGetHistory);
            for (let item of history) {
              let tr = new TransactionEntity();
              tr.userId = account.userId;
              tr.amount = item.amount;
              tr.createdAt = item.createdAt;;
              tr.updatedAt = item.updatedAt;;
              tr.senderPhone = item.senderPhone;
              tr.platform = item.platform;
              if (item.transactionType == 'debit') {
                tr.transactionType = TRANSACTION_TYPE.WITHDRAWAL
              } else if (item.transactionType == 'credit') {
                tr.transactionType = TRANSACTION_TYPE.DEPOSIT
              } else if (item.transactionType == 'user_transfer') {
                tr.transactionType = TRANSACTION_TYPE.TRANSFER
              }
              tr.transactionId = item.transactionId;
              tr.narration = item.narration;
              tr.transactionData = item.transactionData;
              await this.em.save(tr)

            }
            migratedUserTransactionHistory.push(userIdToGetHistory);
          }
          await this.em.save(account);
        }

      }
    }
  }


  getRevampDataSource(): DataSource {
    const PostgresDataSource = new DataSource({
      type: "postgres",
      host: "localhost",
      port: 5432,
      username: "user",
      password: "PBwVTUCrH48Gb",
      database: "bezosusudb",
    });
    PostgresDataSource.initialize();
    return PostgresDataSource;
  }

  async getAccountFromRevamp(dataSource: DataSource, accountNumber: string): Promise<any[]> {
    return await dataSource.manager.query(`select * from account_entity where "accountNumber"='${accountNumber}'`)
  }

  async getTranscationHistoryFromRevamp(dataSource: DataSource, userId: string): Promise<any[]> {
    return await dataSource.manager.query(`select * from transaction_entity  where "userId"='${userId}'`)
  }

  async getCurrentSystemStaffUsers11111(): Promise<any[]> {
    const authUsers = await this.em.query(`select * from auth_user_entity where phone in (
     
      '233542101223'
      )`);
    return authUsers;
  }

  async getCurrentSystemStaffUsers(): Promise<any[]> {
    const authUsers = await this.em.query(`select * from auth_user_entity where phone in ('233209141411')`);
    return authUsers;
  }

  async getUserAccounts(userId: string): Promise<any[]> {
    return await this.em.find(AccountEntity, { where: { userId: userId } })
  }

  async getAccountTransactions(accountId: string): Promise<AccountTransactionEntity[]> {
    return await this.em.find(AccountTransactionEntity, { where: { accountId: accountId } })
  }

}
