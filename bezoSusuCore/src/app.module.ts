import { RequestContextModule } from '@medibloc/nestjs-request-context';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { connectionSource } from '../ormconfig';
import { DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { globalConfig } from './config';
import { AuthModule } from './modules/auth/auth.module';
import { AppRequestContext } from './utils/app-request.context';
import { MainModule } from './modules/main/main.module';
import { MailModule } from './modules/mail/mail.module';
import { AccountModule } from './modules/account/account.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SavingsGoalModule } from './modules/savings-goal/savings-goal.module';
import { TransactionModule } from './modules/transactions/transaction.module';
import { ConsoleModule } from 'nestjs-console';
import { SeederModule } from './modules/seeder/seeder.module';
import { FileUploadModule } from './modules/fileupload/fileupload.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MigrationModule } from './modules/migration/migration.module';
import { UserPinModule } from './modules/userpin/userpin.module';
import { InvestmentEntity } from './modules/investment/entities/invest.entity';
import { CronModule } from './modules/cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TransferModule } from './modules/transfers/transfer.module';
import { UssdApiModule } from './modules/ussdapi/ussdapi.module';
import { InvestmentModule } from './modules/investment/investment.module';

@Module({
  imports: [
    ConsoleModule,
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      load: [globalConfig],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: async () => (await connectionSource) as DataSourceOptions,
    }),
    RequestContextModule.forRoot({
      isGlobal: true,
      contextClass: AppRequestContext,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (config: ConfigType<typeof globalConfig>) => {
        const parsed = new URL(config.mongo.uri);
        const baseUri = `${parsed.protocol}//${parsed.username}:${parsed.password}@${parsed.host}`;
        const opts = {
          uri: baseUri,
          dbName: 'bezosusuDBlive',
        } as MongooseModuleOptions;
        return opts;
      },
      inject: [globalConfig.KEY],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    MainModule,
    MailModule,
    AccountModule,
    WalletModule,
    SavingsGoalModule,
    TransactionModule,
    SeederModule,
    FileUploadModule,
    NotificationModule,
    MigrationModule,
    UserPinModule,
    InvestmentEntity,
    TransferModule,
    UssdApiModule,
    InvestmentModule,
  ],
  controllers: [AppController],
  providers: [AppService,],
  exports: [AuthModule],
})
export class AppModule { }





