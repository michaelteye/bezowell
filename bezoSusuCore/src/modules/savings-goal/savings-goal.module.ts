import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavingsGoalEntity } from './entities/savings-goal.entity';
import { GoalTypeEntity } from './entities/goal-type.entity';
import { GoalTypeController } from './controllers/goal-type.controller';
import { SavingsGoalController } from './controllers/savings-goal.controller';
import { GoalTypeService } from './services/goal-type.service';
import { SavingsGoalService } from './services/savings-goal.service';
import { MigrationService } from '../migration/services/migration.service';
import { UserGoalTypeController } from './controllers/user-goal-type.controller';
import { AccountService } from '../account/services/account.service';
import { TransferCoreService } from '../transfers/services/transfer.core.service';
import { NotificationService } from '../notifications/services/notification.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule,TypeOrmModule.forFeature([SavingsGoalEntity, GoalTypeEntity])],
  providers: [SavingsGoalService, GoalTypeService, MigrationService,AccountService,TransferCoreService,NotificationService],
  controllers: [
    GoalTypeController,
    SavingsGoalController,
    UserGoalTypeController,
  ],
  exports: [SavingsGoalService, GoalTypeService,AccountService],
})
export class SavingsGoalModule { }
