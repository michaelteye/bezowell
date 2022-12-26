import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
 // import { UserAccountEntity } from './entities/useraccount.entity';
import { AddressEntity } from './entities/address.entity';
// import { AdminEntity } from './entities/admin.entity';
import { PlatformEntity } from './entities/platform.entity';
import { UserEntity } from './entities/user.entity';
import { PaymentMethodEntity } from './entities/paymentmethod.entity';
import { CreateAdminCommand } from './commands/admin.command';
import { CreateAccountCommand } from './commands/account.command';
import { PasswordEncoderService } from '../auth/services/password-encorder.service';
import { CreateUserCommand } from './commands/user.command';
import { AuthModule } from '../auth/auth.module';
import { TransactionModule } from '../transactions/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AddressEntity,
      PlatformEntity,
      UserEntity,
      PaymentMethodEntity,
      ]),
    AuthModule,
  ],
  providers: [
    PasswordEncoderService,
    // commands
    CreateAdminCommand,
    CreateAccountCommand,
    CreateUserCommand,
  ],
  exports: [
    // commands
    CreateAdminCommand,
    CreateAccountCommand,
    CreateUserCommand,
  ],
  controllers: [],
})
export class MainModule {}
