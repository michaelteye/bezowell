import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SmsService } from './services/sms.service';
import { HttpRequestService } from './services/http.request.service';

@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [SmsService, HttpRequestService],
  exports: [SmsService, HttpRequestService],
})
export class SharedModule {}
