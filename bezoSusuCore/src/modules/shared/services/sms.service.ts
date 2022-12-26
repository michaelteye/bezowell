import { Injectable } from '@nestjs/common';
import { HttpRequestService } from './http.request.service';

@Injectable()
export class SmsService extends HttpRequestService {
  async sendSms(from: string, to: string, text: string): Promise<any> {
    if (process.env.NODE_ENV === 'test') {
      from = '233542853417';
    }
    const url = `${this.cfg.sms.url}to=${to}&from=${from}&sms=${text}`;
    await this.get(url);
    return this.response;
  }
}
