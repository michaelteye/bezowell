import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { EntityManager } from 'typeorm';
import { uuid } from 'uuidv4';
import { TransferCoreDto } from '../dto/TransferCoreDto';
import { TransferCoreResponseDto } from '../dto/TransferCoreResponseDto';
import { TRANSFER_STATUS_CODE } from '../enums/transferstatus.enum';
import TRANSFER_STATUS_MESSAGE from '../enums/transferstatus.message';
import { gen } from 'n-digit-token';
import { AccountTransactionEntity } from 'src/modules/transactions/entities/account-transaction.entity';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import Decimal from 'decimal.js';
import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';

@Injectable()
export class TransferCoreService {
  constructor(
    @InjectEntityManager('default') private em: EntityManager
  ) { }

  buildResponseMessage(statusCode, trxnRef?, userRef?): TransferCoreResponseDto {
    const transferResponse = new TransferCoreResponseDto();
    transferResponse.statusCode = statusCode;
    transferResponse.message = TRANSFER_STATUS_MESSAGE[transferResponse.statusCode];
    transferResponse.trxnRef = trxnRef || '';
    transferResponse.userRef = userRef || '';
    console.log('The transfer response >>>', transferResponse);
    return transferResponse;
  }

  accountHasSufficientBalance(account: AccountEntity, input: TransferCoreDto): boolean {
    const balance = new Decimal(account.balance);
    const amount = new Decimal(input.amount);
    console.log('The account balance >>', balance.toFixed(2));
    console.log('The withdrawing amount is >>', amount.toFixed(2));
    return balance.greaterThanOrEqualTo(amount);
  }

  async writeDebit(account: AccountEntity, input: TransferCoreDto, transaction: TransactionEntity) {
    const accountTransaction = new AccountTransactionEntity();
    accountTransaction.accountId = account.id;
    accountTransaction.amount = Number(input.amount);
    accountTransaction.initialBalance = Number(account.balance);
    accountTransaction.phone = transaction.senderPhone;
    const initialBalance = new Decimal(account.balance);
    const debitAmount = new Decimal(input.amount);
    const currentBalance = initialBalance.minus(debitAmount).toFixed(2);

    accountTransaction.transactionType = TRANSACTION_TYPE.DEBIT;
    accountTransaction.currentBalance = Number(currentBalance);
    accountTransaction.transactionStatus = TRANSACTION_STATUS.SUCCESS;;
    accountTransaction.transactionId = transaction.transactionId;
    accountTransaction.userRef = transaction.userRef;
    accountTransaction.referenceId = input.reference;
    accountTransaction.narration = input.fromAccountNarration;
    await this.em.save(accountTransaction);
  }

  async writeCredit(account: AccountEntity, input: TransferCoreDto, transaction: TransactionEntity) {
    const accountTransaction = new AccountTransactionEntity();
    accountTransaction.accountId = account.id;
    accountTransaction.amount = Number(input.amount);
    accountTransaction.initialBalance = Number(account.balance);
    accountTransaction.phone = transaction.senderPhone;
    const initialBalance = new Decimal(account.balance);
    const creditAmount = new Decimal(input.amount);
    const currentBalance = initialBalance.plus(creditAmount).toFixed(2);

    accountTransaction.transactionType = TRANSACTION_TYPE.CREDIT;
    accountTransaction.currentBalance = Number(currentBalance);
    accountTransaction.transactionStatus = TRANSACTION_STATUS.SUCCESS;
    accountTransaction.transactionId = transaction.transactionId;
    accountTransaction.userRef = transaction.userRef;
    accountTransaction.referenceId = input.reference;
    accountTransaction.narration = input.toAccountNarration
    await this.em.save(accountTransaction);
  }

  async computeNewBalance(account: AccountEntity, input: TransferCoreDto, transType: TRANSACTION_TYPE) {
    switch (transType) {
      case TRANSACTION_TYPE.DEBIT:
        {
          const initialBalance = new Decimal(account.balance);
          const debitAmount = new Decimal(input.amount);
          const newBalance = initialBalance.minus(debitAmount).toFixed(2);
          account.balance = Number(newBalance);
          break;
        }
      case TRANSACTION_TYPE.CREDIT: {
        const initialBalance = new Decimal(account.balance);
        const creditAmount = new Decimal(input.amount);
        const newBalance = initialBalance.plus(creditAmount).toFixed(2);
        account.balance = Number(newBalance);
        break;
      }
    }
    await this.em.save(account);
  }

  async writeTransaction(fromAccount: AccountEntity, toAccount: AccountEntity, input: TransferCoreDto) {
    const transaction = new TransactionEntity();
    transaction.amount = Number(input.amount);
    transaction.transactionType = TRANSACTION_TYPE.TRANSFER;
    transaction.transactionId = input.reference;
    transaction.fromAccountId = fromAccount.id;
    transaction.toAccountId = toAccount.id;
    transaction.userId = fromAccount.userId;
    transaction.transactionStatus = TRANSACTION_STATUS.SUCCESS;
    if (input.fromAccountNarration === input.toAccountNarration) {
      transaction.narration = `${input.fromAccountNarration}`;
    } else {
      if (input.fromAccountNarration && input.fromAccountNarration !== '') {
        transaction.narration = `${input.fromAccountNarration}`;
      }
      if (input.toAccountNarration != 'undefined' && input.toAccountNarration) {
        transaction.narration += `:${input.toAccountNarration}`;
      }
    }
    transaction.userRef = "" + gen(5);
    if (!input.reference || input.reference == '') {
      transaction.transactionId = uuid();
    }
    transaction.transactionData = input;
    const savedTransaction = await this.em.save(transaction);
    return savedTransaction;
  }


  async transfer(input: TransferCoreDto, transaction?: TransactionEntity): Promise<TransferCoreResponseDto> {
    const fromAccount = await this.em.findOne(AccountEntity, {
      where: { id: input.fromAccountId },
    });
    const toAccount = await this.em.findOne(AccountEntity, {
      where: { id: input.toAccountId }
    });
    // if (!fromAccount.allowWithdrawal) {
    //   console.log('Alllowing withdrawall for ', fromAccount)
    //   return this.buildResponseMessage(TRANSFER_STATUS_CODE.WITHDRAWAL_NOT_ALLOWED);
    // }
    if (!toAccount.allowDeposit) {
      console.log('Allowing deposit for ', toAccount)
      return this.buildResponseMessage(TRANSFER_STATUS_CODE.DEPOSIT_NOT_ALLOWED);
    }
    if (!this.accountHasSufficientBalance(fromAccount, input)) {
      if (!fromAccount.canOverDraw) {
        return this.buildResponseMessage(TRANSFER_STATUS_CODE.INSUFFICIENT_BALANCE);
      }
    }
    if (transaction) {
      transaction.amount = Number(input.amount);
      transaction.transactionType = TRANSACTION_TYPE.TRANSFER;
      transaction.transactionId = input.reference;
      transaction.fromAccountId = fromAccount.id;
      transaction.toAccountId = toAccount.id;
      transaction.userId = fromAccount.userId;
      transaction.transactionStatus = TRANSACTION_STATUS.SUCCESS;
      if (input.fromAccountNarration === input.toAccountNarration) {
        transaction.narration = `${input.fromAccountNarration}`;
      } else {
        if (input.fromAccountNarration && input.fromAccountNarration !== '') {
          transaction.narration = `${input.fromAccountNarration}`;
        }
        if (input.toAccountNarration != 'undefined' && input.toAccountNarration) {
          transaction.narration += `:${input.toAccountNarration}`;
        }
      }
      if (!transaction.userRef) {
        transaction.userRef = "" + gen(5);
      }
      if (!input.reference || input.reference == '') {
        transaction.transactionId = uuid();
      }
      transaction.transactionData = input;
      await this.em.save(transaction);
    } else {
      transaction = await this.writeTransaction(fromAccount, toAccount, input)
    }
    // const transaction = await this.writeTransaction(fromAccount, toAccount, input)
    await this.writeDebit(fromAccount, input, transaction);
    await this.writeCredit(toAccount, input, transaction);
    await this.computeNewBalance(fromAccount, input, TRANSACTION_TYPE.DEBIT);
    await this.computeNewBalance(toAccount, input, TRANSACTION_TYPE.CREDIT);
    return this.buildResponseMessage(TRANSFER_STATUS_CODE.SUCCESS, transaction.transactionId, transaction.userRef);
  }
}
