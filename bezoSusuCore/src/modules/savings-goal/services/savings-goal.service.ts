import { SavingsGoalEntity } from './../entities/savings-goal.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { SavingsGoalDto, SavingsGoalInputDto } from '../dtos/savings-goal.dto';
import { AccountEntity } from '../../account/entities/account.entity';
import { STATUS } from '../../../../src/modules/auth/entities/enums/status.enum';
import { AppRequestContext } from '../../../../src/utils/app-request.context';
import { getAppContextALS } from '../../../../src/utils/context';
import { GOAL_STATUS } from '../../../../src/modules/auth/entities/enums/goal-status.enum';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { generateCode } from 'src/utils/shared';
import { WalletTypeEntity } from '../../wallet/entities/wallet.entity';
import { DEPOSIT_PREFERENCE } from 'src/modules/main/entities/enums/deposittype.enum';

import { format as formatDate, isBefore, isEqual } from 'date-fns';
import { response } from 'express';
import { TransferCoreDto } from 'src/modules/transfers/dto/TransferCoreDto';
import { uuid } from 'uuidv4';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { AccountService } from 'src/modules/account/services/account.service';
import { TransferCoreService } from 'src/modules/transfers/services/transfer.core.service';
import { TRANSFER_STATUS_CODE } from 'src/modules/transfers/enums/transferstatus.enum';
import { NotificationService } from 'src/modules/notifications/services/notification.service';
import { tr } from 'date-fns/locale';

@Injectable()
export class SavingsGoalService {
  constructor(
    @InjectEntityManager('default') private em: EntityManager,
    private accountService: AccountService,
    private transferCoreService: TransferCoreService,
    private notificationService: NotificationService,
  ) {}

  async create(input: SavingsGoalInputDto): Promise<SavingsGoalDto> {
    const ctx = getAppContextALS<AppRequestContext>();
    if (await this.savingsGoalExist(input.name, ctx.authUser.userId)) {
      throw new HttpException('Savings Goal already exist', 400);
    }
    const account = new AccountEntity();
    account.name = input.name;
    account.accountTypeId = input.accountTypeId;
    console.log('The user Id is >>>', ctx.authUser.userId);
    account.userId = ctx.authUser.userId;
    account.accountNumber = '' + Number(generateCode(10));
    account.walletId = input.walletId ?? (await this.getDefaultWalletId());

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const checkStartDate =
      typeof input.startDate === 'string'
        ? new Date(input.startDate)
        : input.startDate;

    const checkEndDate =
      typeof input.endDate === 'string'
        ? new Date(input.endDate)
        : input.endDate;

    if (isBefore(currentDate, checkStartDate) === true) {
      throw new HttpException('You cannot use a past date', 400);
    }

    if (isBefore(checkEndDate, checkStartDate) === true) {
      throw new HttpException('Start date must be before end date', 400);
    }
    const savingsGoal = new SavingsGoalEntity();
    savingsGoal.name = input.name;
    savingsGoal.description = input.description;
    savingsGoal.goalTypeId = input.goalTypeId;
    savingsGoal.account = account;
    savingsGoal.amountToSave = input.amount;
    savingsGoal.preference = DEPOSIT_PREFERENCE.manual;
    savingsGoal.period = input.period;
    savingsGoal.startDate = checkStartDate;
    savingsGoal.endDate = checkEndDate;
    savingsGoal.goalStatus = GOAL_STATUS.INPROGRESS;
    savingsGoal.userId = ctx.authUser.userId;
    savingsGoal.frequency = input.frequency;
    return this.em.save(savingsGoal) as unknown as SavingsGoalDto;
  }

  async all(): Promise<SavingsGoalDto[]> {
    const ctx = getAppContextALS<AppRequestContext>();
    const goals = await this.em.find(SavingsGoalEntity, {
      relations: ['account', 'goalType'],
      where: {
        userId: ctx.authUser.userId,
        name: Not('Primary'),
        goalStatus: Not('TERMINATED'),
        goalType: { name: Not('Primary') },
      },
    });

    return goals as unknown as SavingsGoalDto[];
  }

  async get(id: string): Promise<SavingsGoalDto> {
    const ctx = getAppContextALS<AppRequestContext>();
    return (await this.em.findOne(SavingsGoalEntity, {
      where: { id: id, userId: ctx.authUser.userId },
      relations: ['account', 'goalType', 'user'],
    })) as unknown as SavingsGoalDto;
  }

  async getSavingsGoalById(savingsGoalId: string): Promise<SavingsGoalEntity> {
    return await this.em.findOne(SavingsGoalEntity, {
      where: { id: savingsGoalId },
      relations: ['account'],
    });
  }

  async update(id: string, input: { name: string }): Promise<SavingsGoalDto> {
    const savingsGoal: SavingsGoalEntity | SavingsGoalDto = await this.get(id);
    if (!savingsGoal) {
      throw new HttpException('AccountType not found', 404);
    }
    savingsGoal.name = input.name;
    return this.em.save(savingsGoal) as unknown as SavingsGoalDto;
  }
  async updateFavourite(
    id: string,
    input: { isFavorite: boolean },
  ): Promise<SavingsGoalDto> {
    const savingsGoal: SavingsGoalEntity | SavingsGoalDto = await this.get(id);
    // if(savingsGoal){
    //   return
    // }
    if (!savingsGoal) {
      throw new HttpException('AccountType not found', 404);
    }
    savingsGoal.isFavorite = input.isFavorite;

    // return { "status":200, "message":"data successfully updated" }  as unknown as SavingsGoalDto
    return this.em.save(savingsGoal) as unknown as SavingsGoalDto;
  }


  async delete(id: string): Promise<SavingsGoalDto> {
    const savingsGoal: SavingsGoalEntity | SavingsGoalDto = await this.get(id);
    if (!savingsGoal){
      throw new HttpException('Savings Goal not found', 404);
    }
    if (savingsGoal.goalStatus == GOAL_STATUS.TERMINATED){
      throw new HttpException('This savings goal cannot be altered', 404);
    }
    savingsGoal.goalStatus = GOAL_STATUS.TERMINATED;
    const ctx = getAppContextALS<AppRequestContext>();
    const primaryAccount = await this.accountService.getUserPrimaryAccount({
      userId: ctx.authUser.userId,
});
// GetAccount by savings goal
    const secondaryAccount = await this.getSavingsGoalById(id);
    const userSavingGoalAccount = await this.em.findOne(AccountEntity,{
      where: { id: secondaryAccount.accountId },
    });
    console.log('primaryAccount', primaryAccount);
    console.log('secondaryAccount', secondaryAccount);
    console.log('userSavingGoalAccount', userSavingGoalAccount);
    const reference = uuid();
    const transferRequest = new TransferCoreDto();
    transferRequest.fromAccountId = userSavingGoalAccount.id;
    transferRequest.toAccountId = primaryAccount.id;
    transferRequest.reference = reference;
    transferRequest.fromAccountNarration =  'SAVINGS GOAL CLOSURE ';
    transferRequest.toAccountNarration =  'SAVINGS GOAL CLOSURE ';
    transferRequest.amount = userSavingGoalAccount.balance;
    const transferResponse = await this.transferCoreService.transfer(
      transferRequest,
    );
    console.log('Transfer response from savings goal closure >>',transferResponse);
    if (transferResponse.statusCode == TRANSFER_STATUS_CODE.SUCCESS) {
      let goal = await this.em.save(savingsGoal);
      await this.notificationService.sendSms({
        to: ctx.authUser.phone,
        sms: `You just received GHS${userSavingGoalAccount.balance} into your primary account. Thank you for choosing BezoSusu.`,
      });
      return goal;
    }else{
      throw new HttpException('Deletion of goal failed'+transferResponse.message, 404);
    }
  }

  async getDefaultWalletId(): Promise<string> {
    return this.em
      .findOne(WalletTypeEntity, { where: { name: 'Local' } })
      .then((wallet) => wallet.id);
  }

  async savingsGoalExist(name: string, userId: string) {
    return await this.em.findOne(SavingsGoalEntity, {
      where: { name: name, userId: userId },
    });
  }
}
