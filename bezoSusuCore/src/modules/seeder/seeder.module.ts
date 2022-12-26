import { Module } from '@nestjs/common';
import { PasswordEncoderService } from '../auth/services/password-encorder.service';
import { SeederService } from './services/seeder.service';

@Module({
  providers: [SeederService,PasswordEncoderService],
})
export class SeederModule {}
