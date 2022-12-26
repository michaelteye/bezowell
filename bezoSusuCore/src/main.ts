import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthModule } from './modules/auth/auth.module';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { MainModule } from './modules/main/main.module';
import { AccountModule } from './modules/account/account.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { SavingsGoalModule } from './modules/savings-goal/savings-goal.module';
import { TransactionModule } from './modules/transactions/transaction.module';
import { NotificationModule } from './modules/notifications/notification.module';
import { UserPinModule } from './modules/userpin/userpin.module';
import { UssdApiModule } from './modules/ussdapi/ussdapi.module';
import { TransferModule } from './modules/transfers/transfer.module';
import { InvestmentModule } from './modules/investment/investment.module';
import { StreakModule } from './modules/streak/streak.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: /.*/,
  });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v2');

  const config = new DocumentBuilder()
    .setTitle('BEZOMONEY API Platform')
    .setDescription('Description')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    include: [
      MainModule,
      AuthModule,
      AccountModule,
      WalletModule,
      SavingsGoalModule,
      TransactionModule,
      NotificationModule,
      UserPinModule,
      TransferModule,
      UssdApiModule,
      InvestmentModule,
      StreakModule
      
    ],
  });
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(process.env.PORT || 4200);
}
bootstrap();
