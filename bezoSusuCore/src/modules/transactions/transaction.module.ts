import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './controllers/transaction.controller';
import { TransactionService } from './services/transaction.service';
import { TransactionEntity } from './entities/transaction.entity';
import { PaymentMethodEntity } from '../main/entities/paymentmethod.entity';
import { HttpModule } from '@nestjs/axios';
import { HttpRequestService } from '../shared/services/http.request.service';
import { CallBackController } from './controllers/callback.controller';
import { AccountTransactionEntity } from './entities/account-transaction.entity';
import { AccountEntity } from '../account/entities/account.entity';
import { UserPinModule } from '../userpin/userpin.module';
import { SharedModule } from '../shared/shared.module';
import { AccountModule } from '../account/account.module';
import { TransferModule } from '../transfers/transfer.module';
import { TransferService } from '../transfers/services/transfer.service';
import { TransferCoreService } from '../transfers/services/transfer.core.service';
import { AuthModule } from '../auth/auth.module';
import { UserService } from '../auth/services/user.service';
import { SavingsGoalModule } from '../savings-goal/savings-goal.module';
import { SavingsGoalService } from '../savings-goal/services/savings-goal.service';
import { TransactionHistoryService } from './services/transaction.history.service';
import { NotificationService } from '../notifications/services/notification.service';
import { FileUploadService } from '../fileupload/services/fileupload.service';
import { FileUploadModule } from '../fileupload/fileupload.module';

export const Entities = [
  TransactionEntity,
  PaymentMethodEntity,
  AccountTransactionEntity,
  AccountEntity,
];

@Module({
  imports: [
    TypeOrmModule.forFeature(Entities),
    HttpModule,
    AuthModule,
    UserPinModule,
    SharedModule,
    SavingsGoalModule,
    AccountModule,
    TransferModule,
    FileUploadModule
  ],
  controllers: [TransactionController, CallBackController],
  providers: [TransactionService,SavingsGoalService, HttpRequestService, TransferService, TransferCoreService, TransactionHistoryService, UserService,NotificationService],
  exports: [TypeOrmModule.forFeature(Entities), TransactionService],
})
export class TransactionModule { }
