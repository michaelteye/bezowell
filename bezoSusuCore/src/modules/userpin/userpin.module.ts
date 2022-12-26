import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPinEntity } from './entities/userpin.entity';
import { UserPinService } from './services/userpin.service';
//import { AuthModule } from '../auth/auth.module';
import { UserPinController } from './controllers/userpin.controller';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationService } from '../notifications/services/notification.service';
import { AuthService } from '../auth/services/auth.service';
import { PasswordEncoderService } from '../auth/services/password-encorder.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([UserPinEntity]),
    HttpModule,
    SharedModule,
  ],
  controllers: [UserPinController],
  providers: [UserPinService, NotificationService],
  exports: [UserPinService],
})
export class UserPinModule { }
