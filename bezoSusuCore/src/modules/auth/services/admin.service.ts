import { AppRequestContext } from '../../../utils/app-request.context';
import { getAppContextALS } from '../../../utils/context';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
// import {
//   EmailIdentityProviderServiceToken,
//   EmailIdentityProviderServiceInterface,
// } from '../interfaces/email-identity-provider.service.interface';
// import { EmailIdentityInterface } from '../interfaces/email-identity.inteface';
import {
  UserProviderServiceToken,
  UserProviderServiceInterface,
} from '../interfaces/user-identity-provider.service.interface';

import { UserInterface } from '../interfaces/user.interface';
import { PasswordEncoderService } from './password-encorder.service';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { IdentityInterface } from '../interfaces/identity.interface';
import { IdentityProviderServiceInterface, IdentityProviderServiceToken } from '../interfaces/identity-provider.service.interface';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { uuid } from 'uuidv4';
import { TransferCoreDto } from 'src/modules/transfers/dto/TransferCoreDto';
import { TransferCoreService } from 'src/modules/transfers/services/transfer.core.service';
import { TRANSFER_STATUS_CODE } from 'src/modules/transfers/enums/transferstatus.enum';
import { NotificationService } from 'src/modules/notifications/services/notification.service';

export interface AuthenticateInput {
  email: string;
  password: string;
}

//export class EmailIdentityService<UserEntity extends UserInterface = UserInterface, Identity extends EmailIdentityInterface = EmailIdentityInterface> {

@Injectable()
export class AdminIdentityService<
  UserEntity extends UserInterface = UserInterface,
  Identity extends IdentityInterface = IdentityInterface,
> {

  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private transferCoreService: TransferCoreService,
    private notificationService: NotificationService,
    @Inject(PasswordEncoderService)
    private readonly encoder: PasswordEncoderService
  ) { }



  async authenticate(
    input: AuthenticateInput,
  ): Promise<AuthUserEntity> {
    // const identity = (await this.identityProvider.retrieveIdentityByEmail(
    //   input.email,
    // )) as AuthUserEntity;

    const identity = await this.em.findOne(AuthUserEntity, {
      where: { email: input.email },
      relations: ['user']
    }) as AuthUserEntity
    if (!identity) {
      throw new BadRequestException('missing_identity');
    }
    console.log('identity', identity);
    const user = identity.user
    //  const user = identity
    console.log('user', user);
    if (!user) {
      throw new BadRequestException('missing_user');
    }
    if (
      this.encoder.verifyPassword(
        input.password,
        identity.password,
      )
    ) {
      // return null//
      return identity

      // return null
    } else {
      throw new BadRequestException('wrong_credentials');
    }
  }

  async me() {
    const ctx = getAppContextALS<AppRequestContext>();
    return ctx.authUser;
  }

  async reverseTransaction(id: number) {
    const transactionDetails = await this.em.findOne(TransactionEntity, {
      where: { id },
    });
    if (transactionDetails == null) {
      return { status: "404", message: "Transaction not found" }
    }
    const transferRequest = new TransferCoreDto();
    transferRequest.fromAccountId = transactionDetails.toAccountId;
    const userAuth = await this.em.findOne(AuthUserEntity, {
      where: { userId: transactionDetails.userId }
    })
    transferRequest.toAccountId = transactionDetails.fromAccountId;
    transferRequest.reference = "REV:" + transactionDetails.transactionId;
    transferRequest.fromAccountNarration = 'REV:' + transactionDetails.narration
    transferRequest.toAccountNarration = 'REV:' + transactionDetails.narration
    transferRequest.amount = transactionDetails.amount;
    console.log('The transfer log >>>', transferRequest)
    const transferResponse = await this.transferCoreService.transfer(transferRequest);
    console.log('The transfer response >>>', transferResponse)
    if (transferResponse.statusCode == TRANSFER_STATUS_CODE.SUCCESS) {
      const smsMessageReciever = await this.notificationService.sendSms({
        to: userAuth.phone, sms: `Your withdrawal of GHS${transactionDetails.amount} has been reversed to your account.REF:${transferResponse.userRef}`
      })
      return { status: "00", message: "Transaction successfully reversed" }
    } else {
      return { status: transferResponse.statusCode, message: transferResponse.message }
    }
  }
}
