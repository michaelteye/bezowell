import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { EntityManager } from 'typeorm';
import { TRANSACTION_TYPE } from '../../enums/transaction-type.enum';
import { MigrationAccountEntity } from '../entitites/migration.account.entity';
import { MigrationWithDrawalEntity } from '../entitites/migration.withdrawal.entity';
import { MigrationService } from '../services/migration.service';

@Console()
export class MigrateWithdrawalsCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
    private service: MigrationService,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:withdrawals',
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
    console.log('Migrating withdrawals ....');
    await this.migrateTransactions();
    console.log('Migration complete ....');
  }

  // load account type

  async getDeposits() {
    const deposits = await this.db
      .collection('withdrawal')
      .aggregate()
      .lookup({
        from: 'personal_savings',
        localField: 'savingsRefNo',
        foreignField: 'refNo',
        as: 'personal_savings',
      })
      .lookup({
        from: 'account',
        localField: 'personal_savings.account_id',
        foreignField: '_id',
        as: 'accounts',
      })
      .lookup({
        from: 'account_type',
        localField: 'accounts.account_type_id',
        foreignField: '_id',
        as: 'account_type',
      })

      .toArray();
    return deposits;
  }

  async migrateTransactions() {
    const userDeposits = await this.getDeposits();
    //console.log('userDeposits', JSON.stringify(userDeposits, null, 2));
    console.log(userDeposits.length); 

    for (let i = 0; i < userDeposits.length; i ++) {
      const mentity = new MigrationWithDrawalEntity();
      mentity.user_id = userDeposits[i].user_id;
      mentity.data = userDeposits[i];
      const migration = await this.em.save(mentity);
      await this.createTransactions(userDeposits[i], migration);
      //
    }

    console.log(userDeposits.length); 
  }


  async createTransactions(transaction: any, migration:MigrationWithDrawalEntity) {
    try {
     await this.service.saveTransaction(transaction, TRANSACTION_TYPE.WITHDRAWAL);
     migration.migrated=true;
     await this.em.save(migration);
   } catch (error: any) {
     console.log('error', error);
     migration.migrated=false;
     migration.error= error;
     await this.em.save(migration);
   }
}


}
