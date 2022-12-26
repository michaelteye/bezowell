import { Module } from '@nestjs/common';
import { TransferController } from './controllers/transfer.controller';
import { TransferService } from './services/transfer.service';
import { UserPinModule } from '../userpin/userpin.module';
import { AccountModule } from '../account/account.module';
import { CleanTransferCommand } from './commands/clean-tranfer.command';
import { AuthModule } from '../auth/auth.module';
import { TransferCoreService } from './services/transfer.core.service';
import { UserService } from '../auth/services/user.service';
import { AccountService } from '../account/services/account.service';
import { FileUploadModule } from '../fileupload/fileupload.module';
import { NotificationService } from '../notifications/services/notification.service';
import { HttpModule } from '@nestjs/axios';
import { AdminTransferController } from './controllers/admin.transfer.controller';

@Module({
  imports: [HttpModule, AuthModule, UserPinModule, AccountModule, FileUploadModule],
  controllers: [TransferController, AdminTransferController],
  providers: [TransferService, TransferCoreService, UserService, AccountService, CleanTransferCommand, NotificationService],
  exports: [TransferService, CleanTransferCommand],
})
export class TransferModule { }
