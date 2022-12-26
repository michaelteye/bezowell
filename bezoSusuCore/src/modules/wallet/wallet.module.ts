import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountTypeEntity } from '../account/entities/account-type.entity';
import { AccountEntity } from '../account/entities/account.entity';
import { WalletController } from './controllers/wallet.controller';
import { WalletTypeEntity } from './entities/wallet.entity';
import { WalletService } from './services/wallet.service';
import { UserWalletController } from './controllers/user-wallet.controller';

export const Entities = [AccountTypeEntity, AccountEntity, WalletTypeEntity];

@Module({
  imports: [TypeOrmModule.forFeature(Entities)],
  controllers: [WalletController, UserWalletController],
  providers: [WalletService],
  exports: [TypeOrmModule.forFeature(Entities), WalletService],
})
export class WalletModule {}
