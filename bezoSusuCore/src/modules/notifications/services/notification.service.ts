import { Injectable } from '@nestjs/common';
import { FcmService } from 'nestjs-fcm';
import * as firebaseAdmin from 'firebase-admin';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../../main/entities/user.entity';
import { NotificationDto } from '../dtos/notification.dto';
import { getAppContextALS } from '../../../../src/utils/context';
import { AppRequestContext } from '../../../../src/utils/app-request.context';
import { DeviceEntity } from '../../../../src/modules/main/entities/device.entity';

import { HttpRequestService } from 'src/modules/shared/services/http.request.service';
import { HttpStatus } from '@nestjs/common/enums';
import { HttpException } from '@nestjs/common/exceptions';


export type NotificationResponse = {
  failureCount: number;
  successCount: number;
  failedDeviceIds: any[];
};

export interface EmailInterface {
  subject: string,
  message: string,
  to: string | [],
  from: string,
  template: {
    provider: string,
    name: string,
    data: any
  }
}
export interface SmsInterface {
  to: string | [],
  sms: string,
}

export interface EmailSMSInterface {
  to: string | [],
  sms: string,
  from: string,
  subject: string,
  message: string,
  toemail: string,
  template: {
    provider: string,
    name: string,
    data: any
  }
}


@Injectable()
export class NotificationService extends HttpRequestService {
  constructor(private service: FcmService, private em: EntityManager) {
    super();
  }

  async sendUsersNotifications(input: NotificationDto) {
    const ctx = getAppContextALS<AppRequestContext>();
    const userDevice = await this.em.findOne(DeviceEntity, {
      where: { userId: ctx.authUser.userId },
    });
    const sendNotification = await this.sendNotifications(
      [userDevice.deviceId],
      input.title,
      input.message,
    );
    return sendNotification;
  }

  async sendNotifications(
    devices: string[],
    title: string,
    message: string,
  ): Promise<NotificationResponse> {
    const payload: firebaseAdmin.messaging.MessagingPayload = {
      notification: {
        title: title,
        body: message,
      },
    };
    return await this.service.sendNotification(devices, payload, true);
  }

  async userDevices(): Promise<any[]> {
    const users: UserEntity[] = await this.em.find(UserEntity, {
      relations: ['devices'],
    });
    return users.flatMap((user) =>
      user.devices.map((device) => device.deviceId),
    );
  }

  // async sendEmail(payload: EmailInterface): Promise<any> {
  //   return this.httpService.axiosRef.post('http://localhost:3000/api/sendMail', payload);

  // }

  

  async sendSms(payload: SmsInterface) {
    await this.post(this.cfg.sms.url, payload).catch(err => {
      throw new HttpException('Unable to send otp', HttpStatus.BAD_REQUEST);

    })
    this.response

  }

  async sendEmail(payload: EmailInterface) {

    await this.post('https://localhost:3000/api/sendMail', payload).catch(err => {
      throw new HttpException('Unable to send otp', HttpStatus.BAD_REQUEST);

    })
    this.response

  }

  async sendEmailSMS(payload: EmailInterface) {

    await this.post('http://localhost:3000/api/sendMail', payload).catch(err => {
      throw new HttpException('Unable to send otp', HttpStatus.BAD_REQUEST);

    })
    this.response

  }



}
