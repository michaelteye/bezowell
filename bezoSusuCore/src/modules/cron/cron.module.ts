import { Module } from '@nestjs/common';
// import { TransactionCronService } from './services/transactions.cron.service';
import { SavingGoalCronService } from './services/savings-goal.cron.service';
import { TransactionModule } from '../transactions/transaction.module';
import { SavingsGoalModule } from '../savings-goal/savings-goal.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoalEntity } from '../savings-goal/entities/savings-goal.entity';
import { AccountEntity } from '../account/entities/account.entity';

export const Entities = [
  SavingsGoalEntity,
  AccountEntity
];

@Module({
  imports: [TypeOrmModule.forFeature(Entities), SavingsGoalModule],
  controllers: [],
  providers: [SavingGoalCronService],
})
export class CronModule {}
