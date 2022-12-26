import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthModule } from '../auth/auth.module';
import { UssdController } from './controllers/ussdapi.controller';
import { UssdApiService } from './services/ussdapi.service';
import { SavingsGoalModule } from '../savings-goal/savings-goal.module';
import { TransactionModule } from '../transactions/transaction.module';
import { UserPinModule } from '../userpin/userpin.module';
import { TransferModule } from '../transfers/transfer.module';
import { TransferService } from '../transfers/services/transfer.service';
import { AccountService } from '../account/services/account.service';
import { AccountModule } from '../account/account.module';
import { TransferCoreService } from '../transfers/services/transfer.core.service';
import { NotificationService } from '../notifications/services/notification.service';

@Module({
  imports: [HttpModule, AuthModule, SavingsGoalModule,AccountModule, TransactionModule, UserPinModule, TransferModule],
  controllers: [UssdController],
  providers: [UssdApiService,TransferService,TransferCoreService,AccountService,NotificationService],
  exports: [UssdApiService],
})
export class UssdApiModule { }
