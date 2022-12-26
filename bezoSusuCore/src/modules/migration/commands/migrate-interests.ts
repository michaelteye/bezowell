import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';

import { EntityManager } from 'typeorm';

import { TRANSACTION_TYPE } from '../../enums/transaction-type.enum';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';

import { MigrationService } from '../services/migration.service';

@Console()
export class MigrateInterestCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    private service: MigrationService,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:interest',
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
    console.log('Migration started ...');
    const transactions = await this.getInterestTransactions();
    const interests = await this.getInterest();
    await this.migrateInterest(transactions);
    await this.migrateInterestTransactions(interests);
    console.log('Migration Completed !! ...');
  }

  async migrateInterest(interests: any[]) {
    const chunkSize = 1000;
    for (let i = 0; i < interests.length; i += chunkSize) {
      const chunk = interests.slice(i, i + chunkSize);
      await Promise.all([this.createTransactions(chunk)]);
    }
  }

  async createInterestTransactions(data: any[]) {
    for (const item of data) {
      await this.saveInterestTransactions(item);
    }
  }

  async createTransactions(data: any[]) {
    for (const item of data) {
      const transaction = await this.service.saveTransaction(
        item,
        TRANSACTION_TYPE.CREDIT,
      );
      await this.saveInterestTransactions(transaction);
    }
  }

  async saveInterestTransactions(transaction: TransactionEntity | any) {
    //Todo write interest payments to internal accounts account transaction for interest
    // const interest = new InterestEntity();
    // interest.transactionId = transaction.id;
    // interest.accountId = transaction.accountId;
    // interest.amount = Number(transaction.amount);
    // interest.userId = transaction.userId;
    // interest.phone = transaction.recipientPhone;
    // interest.month = this.getMonth(transaction.createdAt);
    // interest.createdAt = transaction.createdAt;
    // await this.em.save(interest);
  }

  // load investment

  getMonth(date: Date) {
    const month = date.getMonth();
    switch (month) {
      case 1:
        return 'January';
      case 2:
        return 'February';
      case 3:
        return 'March';
      case 4:
        return 'April';
      case 5:
        return 'May';
      case 6:
        return 'June';
      case 7:
        return 'July';
      case 8:
        return 'August';
      case 9:
        return 'September';
      case 10:
        return 'October';
      case 11:
        return 'November';
      case 12:
        return 'December';
    }
  }

  async getInterestTransactions() {
    const interests = await this.db
      .collection('transactions')
      .find({ responseMessage: { $regex: '.*Interest.*' } })
      .toArray();
    return interests;
  }

  async getInterest() {
    const interests = await this.db
      .collection('interest_transactions')
      .find({})
      .toArray();
    return interests;
  }

  async migrateInterestTransactions(interests: any[]) {
    const chunkSize = 1000;
    if (interests.length) {
      for (let i = 0; i < interests.length; i += chunkSize) {
        const chunk = interests.slice(i, i + chunkSize);
        await Promise.all([this.createInterestTransactions(chunk)]);
      }
    }
  }
}
