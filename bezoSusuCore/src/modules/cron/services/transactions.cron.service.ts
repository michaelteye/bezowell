// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import {
//   AccountTransactionEntity,
//   TransferStatus,
// } from '../../transactions/entities/account-transaction.entity';
// import { AccountEntity } from 'src/modules/account/entities/account.entity';
// import { Cron } from '@nestjs/schedule';
// import { Injectable, Logger } from '@nestjs/common';
// import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';

// @Injectable()
// export class TransactionCronService {
//   private readonly logger = new Logger('CronService');
//   constructor(
//     @InjectRepository(AccountTransactionEntity)
//     private accountTransactionRepository: Repository<AccountTransactionEntity>,

//     @InjectRepository(AccountEntity)
//     private accountRepository: Repository<AccountEntity>,
//   ) { }

//   // @Cron('* * * * *', {
//   //   name: 'reset-verification-status',
//   //   timeZone: 'Africa/Accra',
//   // })
//   // async updateVerificationStatus() {
//   //   // todo
//   //   //console.log('called at', new Date());
//   // }

//   // @Cron('* * * * *', {
//   //   name: 'handle account transfers',
//   //   timeZone: 'Africa/Accra',
//   // })


//   async transferFunds() {
//     const accountTransactions = await this.accountTransactionRepository.find({
//       where: {
//         transactionStatus: TRANSACTION_STATUS.PENDING,
//       },
//       relations: ['account'],
//     });


//     this.logger.debug(
//       'Account Transactions Cron',
//       JSON.stringify(accountTransactions),
//     );

//     if (accountTransactions.length > 0) {
//       for (const transaction of accountTransactions) {
//         console.log('transaction', transaction);
//         // update transaction status
//         // transaction.transferStatus = TransferStatus.SUCCESS;
//         await this.updateAccountTransactions(transaction);

//         // transfer funds to savings goal account
//         const account: AccountEntity = transaction.account;
//         const amount = Number(account.balance) + Number(transaction.amount);
//         account.balance = amount;
//         await this.updateAccounts(account);
//       }
//     }
//   }

//   async updateAccounts(account: AccountEntity) {
//     const updated = await this.accountRepository.update(account.id, account);
//     console.log('updated', updated);
//   }

//   async updateAccountTransactions(transaction: AccountTransactionEntity) {
//     await this.accountTransactionRepository.update(transaction.id, transaction);
//   }
// }
