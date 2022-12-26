import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAccountTypeController } from './controllers/admin-account-type.controller';
import { AccountTypeEntity } from './entities/account-type.entity';
import { AccountEntity } from './entities/account.entity';
import { AccountTypeService } from './services/account-type.service';
import { UserAccountTypeController } from './controllers/user-account-type.controller';
import { AccountService } from './services/account.service';
import { WalletModule } from '../wallet/wallet.module';
import { AccountController } from './controllers/account.controller';
import { UserPinModule } from '../userpin/userpin.module';
import { CreateLedgerAccountCommand } from './commands/create-ledger-account.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccountTypeEntity, AccountEntity]),
    WalletModule
  ],
  controllers: [
    UserAccountTypeController,
    AdminAccountTypeController,
    AccountController,
  ],
  providers: [AccountTypeService, AccountService, CreateLedgerAccountCommand],
  exports: [AccountService, AccountTypeService],
})
export class AccountModule { }
