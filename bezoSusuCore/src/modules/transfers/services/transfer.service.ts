import { HttpException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import {
  AdminTransferToAccountDto,
  AdminTransferResponseDto,
  TransferToAccountDto,
} from 'src/modules/account/dtos/transfer-account.dto';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { AccountService } from 'src/modules/account/services/account.service';
import { UserDto } from 'src/modules/auth/dto/user.dto';
import { UserService } from 'src/modules/auth/services/user.service';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { UserPinService } from 'src/modules/userpin/services/userpin.service';
import { AppRequestContext } from 'src/utils/app-request.context';
import { getAppContextALS } from 'src/utils/context';
import { EntityManager } from 'typeorm';
import { uuid } from 'uuidv4';
import { AccountDepositWithrawalDto } from '../dto/AccountDepositDto';
import { TransferCoreDto } from '../dto/TransferCoreDto';
import { TransferCoreResponseDto } from '../dto/TransferCoreResponseDto';
import { TRANSFER_STATUS_CODE } from '../enums/transferstatus.enum';
import { SYSTEM_ACCOUNT, SYSTEM_ACCOUNT_TYPE } from './systemaccts.constants';
import { TransferCoreService } from './transfer.core.service';



@Injectable()
export class TransferService {
  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private transferCoreService: TransferCoreService,
    private userService: UserService,
    private userPinService: UserPinService,
    private accountService: AccountService,
    private notificationService: NotificationService,

  ) { }
  async adminTransferToUserAccount(
    input: AdminTransferToAccountDto,
  ): Promise<TransferCoreResponseDto> {
    try {
      const authUser = await this.userService.getAuthUserByPhone(input.phone);
      const creditAccount = await this.accountService.getUserPrimaryAccount({
        userId: authUser.userId,
      });

      if (!creditAccount) {
        throw new HttpException(
          `User with phone ${input.phone} has no Primary Account`,
          404,
        );
      }
      const reference = uuid();
      const debitAccount = await this.em.findOne(AccountEntity, {
        where: { alias: 'staff_allowances' },
      });
      const transferRequest = new TransferCoreDto();
      transferRequest.fromAccountId = debitAccount.id;
      transferRequest.toAccountId = creditAccount.id;
      transferRequest.reference = reference;
      transferRequest.fromAccountNarration = input.narration;
      transferRequest.toAccountNarration = input.narration;
      transferRequest.amount = input.amount;
      const transferResponse = await this.transferCoreService.transfer(transferRequest);
      console.log('The transfer core response >>', transferResponse)
      return transferResponse;
    } catch (error) {
      console.log(error);
      return error.message;
    }
  }

  async transferToUserAccount(input: TransferToAccountDto): Promise<TransferCoreResponseDto> {
    if (!input.verificationId)
      throw new HttpException('Verification Id is required', 400);
    await this.userPinService.verifyId(input.verificationId);
    const ctx = getAppContextALS<AppRequestContext>();
    const debitAccount = await this.accountService.getUserPrimaryAccount({
      userId: ctx.authUser.userId,
    });

    // const creditAccount = await this.accountService.getUserPrimaryAccount({
    //   id: input.transferAccountId,
    // });
    if (input.narration == null || input.narration == '') {
      input.narration = 'Transfer to User ' + ctx.authUser.phone
    }
    const currentUser = await this.em.findOne(UserEntity, {
      where: { id: ctx.authUser.userId }
    })
    const recipientUser = await this.em.findOne(AccountEntity, {
      where: { id: input.transferAccountId },
      relations: ['user']
    })

    const reference = uuid();
    const transferRequest = new TransferCoreDto();
    transferRequest.fromAccountId = debitAccount.id;
    transferRequest.toAccountId = input.transferAccountId;
    transferRequest.reference = reference;
    transferRequest.fromAccountNarration = input.narration;
    transferRequest.toAccountNarration = input.narration;
    transferRequest.amount = input.amount;
    const transferResponse = await this.transferCoreService.transfer(transferRequest);
    if (transferResponse.statusCode == TRANSFER_STATUS_CODE.SUCCESS) {
      await this.notificationService.sendSms({
        to: ctx.authUser.phone, sms: `You just received GHS${input.amount} from ${recipientUser.user.firstName} ${recipientUser.user.firstName} in your BezoWallet.Your transaction reference is ${transferResponse.userRef}. Thank you for choosing BezoSusu.`
      })
      await this.notificationService.sendSms({
        to: ctx.authUser.phone, sms: `You just paid GHS${input.amount} to ${currentUser.firstName} ${currentUser.lastName} in your BezoWallet.Your transaction reference is ${transferResponse.userRef}. Thank you for choosing BezoSusu.`
      })
    }
    return transferResponse;
  }

  async userAccountDeposit(input: AccountDepositWithrawalDto, transaction?: TransactionEntity): Promise<TransferCoreResponseDto> {
    const reference = uuid();
    const transferRequest = new TransferCoreDto();
    transferRequest.fromAccountId = (await this.accountService.getAccountbyType(SYSTEM_ACCOUNT.DEPOSIT_WITHDRAWALS)).id
    transferRequest.toAccountId = input.accountId;
    transferRequest.reference = reference;
    transferRequest.fromAccountNarration = input.narration;
    transferRequest.toAccountNarration = input.narration;
    transferRequest.amount = input.amount;
    const transferResponse = await this.transferCoreService.transfer(transferRequest, transaction);
    return transferResponse;
  }





  async userAccountWithdrawal(input: AccountDepositWithrawalDto, transaction?: TransactionEntity): Promise<TransferCoreResponseDto> {
    const reference = uuid();
    const transferRequest = new TransferCoreDto();
    transferRequest.fromAccountId = input.accountId;
    transferRequest.toAccountId = (await this.accountService.getAccountbyType(SYSTEM_ACCOUNT.DEPOSIT_WITHDRAWALS)).id
    transferRequest.reference = reference;
    transferRequest.fromAccountNarration = input.narration;
    transferRequest.toAccountNarration = input.narration;
    transferRequest.amount = input.amount;
    const transferResponse = await this.transferCoreService.transfer(transferRequest, transaction);
    return transferResponse;
  }

}
