import { Injectable } from '@nestjs/common';
import { CreateSavingsGoalDto } from 'src/modules/ussdapi/dtos/create-savingsgoal.dto';
import { DepositDto } from 'src/modules/ussdapi/dtos/deposit.dto';
import { WithdrawalDto } from 'src/modules/ussdapi/dtos/withdraw.dto';
import { WalletDto } from 'src/modules/ussdapi/dtos/wallet.dto';
import { GenericResponse } from '../dtos/generic-response';
import { SavingsGoalService } from 'src/modules/savings-goal/services/savings-goal.service';
import { GoalTypeService } from 'src/modules/savings-goal/services/goal-type.service';
import { UserService } from 'src/modules/auth/services/user.service';
import { TransactionService } from 'src/modules/transactions/services/transaction.service';
import { UserPinService } from 'src/modules/userpin/services/userpin.service';
import { SavingsGoalInputDto } from 'src/modules/savings-goal/dtos/savings-goal.dto';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import { DepositInputDto } from 'src/modules/transactions/dtos/deposit.dto';
import { TransferDto } from '../dtos/transfer.dto';
import { TransferToAccountDto } from 'src/modules/account/dtos/transfer-account.dto';
import { AccountService } from 'src/modules/account/services/account.service';
import { TransferService } from 'src/modules/transfers/services/transfer.service';
import { AccountTypeService } from 'src/modules/account/services/account-type.service';
import { FREQUENCY_TYPE } from 'src/modules/main/entities/enums/savingsfrequency.enum';


@Injectable()
export class UssdApiService {
  constructor(
    private savingsGoalService: SavingsGoalService,
    private accountService: AccountService,
    private accountTypeService: AccountTypeService,
    private transferService: TransferService,
    private userPinService: UserPinService,
    private goalTypeService: GoalTypeService,
    private transactionService: TransactionService,
  ) { }

  async createSavingsGoal(dto: CreateSavingsGoalDto): Promise<GenericResponse> {
    let input = new SavingsGoalInputDto()
    input.name = dto.nameOfGoal;
    input.accountTypeId = dto.accountTypeId;
    input.goalTypeId = dto.goalTypeId;
    input.amount = dto.goalAmount; //what about goal amount
    //deduction amount
    //specify if its auto-deduct or manual
    //deposit preference is missiong
    input.period = dto.durationOfGoal; //is this the period
    input.description = dto.description;
    input.frequency =  (<any>FREQUENCY_TYPE)[dto.saveFrequency];
    input.startDate = dto.startDate;
    this.savingsGoalService.create(input);
    const response = new GenericResponse();
    response.status = "00";
    response.message = "Goal created successfully";
    return response;
  }

  async getAllGoalTypes(): Promise<any> {
    return await this.goalTypeService.allSavingsGoalTypes();
  }

  async getAccountTypes(): Promise<any> {
    return await this.accountTypeService.all();
  }

  async getMySavingsGoal(): Promise<any> {
    return await this.goalTypeService.all();
  }

  async depositToWallet(dto: DepositDto): Promise<GenericResponse> {
    const pinVerification = await this.userPinService.verifyUserPin(Number(dto.pin));
    const input = new DepositInputDto();
    input.amount = dto.amount;
    input.network = dto.network;
    input.verificationId = pinVerification.verificationId
    const result = await this.transactionService.depositWithdrawal(input, TRANSACTION_TYPE.CREDIT);
    const response = new GenericResponse();
    if (result.status === 'SUCCESS') {
      response.status = "00";
      response.message = "Deposit successful";
    } else if (result.status === 'PENDING') {
      response.message = "Initiated. A payment prompt has been sent to your phone for approval. You can also check your approvals.";
      response.status = "01";
    }
    return response;
  }

  async withdrawFromWallet(dto: WithdrawalDto): Promise<GenericResponse> {
    const pinVerification = await this.userPinService.verifyUserPin(Number(dto.pin));
    const input = new DepositInputDto();
    input.amount = dto.amount;
    input.network = dto.network;
    input.verificationId = pinVerification.verificationId
    const result = await this.transactionService.depositWithdrawal(input, TRANSACTION_TYPE.DEBIT);
    const response = new GenericResponse();
    if (result.status === 'SUCCESS') {
      response.status = "00";
      response.message = "Withdrawal successful";
    } else if (result.status === 'PENDING') {
      response.message = "Withdrawal Initiated.";
      response.status = "01";
    }
    return response;
  }

  async transfer(dto: TransferDto): Promise<GenericResponse> {
    const pinVerification = await this.userPinService.verifyUserPin(Number(dto.pin));
    const input = new TransferToAccountDto();
    input.amount = dto.amount;
    input.transferAccountId = dto.transferAccountId;
    input.verificationId = pinVerification.verificationId;
    input.narration = dto.narration;
    await this.transferService.transferToUserAccount(input);
    const response = new GenericResponse();
    response.status = "00";
    response.message = "Withdrawal successful";
    return response;
  }

  async walletBalance(input: WalletDto): Promise<GenericResponse> {
    return null;//todo implement
  }


}
