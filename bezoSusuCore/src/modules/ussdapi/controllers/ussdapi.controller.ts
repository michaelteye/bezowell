import {
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { UssdApiService } from '../services/ussdapi.service';
import { CreateSavingsGoalDto } from '../dtos/create-savingsgoal.dto';
import { GenericResponse } from '../dtos/generic-response';
import { DepositDto } from '../dtos/deposit.dto';
import { WithdrawalDto } from '../dtos/withdraw.dto';
import { WalletDto } from '../dtos/wallet.dto';
import { InjectUssdUserAuthGuard } from '../guards/injectussduser.guard';
import { TransferDto } from '../dtos/transfer.dto';



@ApiTags('UssdApi')
@Controller('ussdapi')
// @UseGuards(InjectUssdUserAuthGuard)
export class UssdController {
  constructor(private service: UssdApiService) { }

  // Create Savings Goal
  @Post('/createsavingsgoal')
  @ApiResponse({
    status: 200,
    description: 'Savings Goal created successfully.',
    type: GenericResponse,
  })
  @UseGuards(InjectUssdUserAuthGuard)
  async createSavingsGoal(@Body() request: CreateSavingsGoalDto): Promise<GenericResponse> {
    return (await this.service.createSavingsGoal(request)) as GenericResponse;
  }

  @Get('/goaltypes')
  @ApiResponse({
    status: 200,
    description: "Get savingsgoal types e.g. rent,emergency etc"
  })
  async getGoalTypes(): Promise<any> {
    return (await this.service.getAllGoalTypes()) as Promise<any>;
  }

  @Get('/accounttypes')
  @ApiResponse({
    status: 200,
    description: "Get savingsgoal types e.g. rent,emergency etc"
  })
  async getAccountTypes(): Promise<any> {
    return (await this.service.getAccountTypes()) as Promise<any>;
  }

  @Get('/mysavingsgoals')
  @ApiResponse({
    status: 200,
    description: "Get Savings goal of dialing user"
  })
  async mySavingsGoal(): Promise<any> {
    return (await this.service.getAllGoalTypes()) as Promise<any>;
  }

  @Post('/deposit')
  @ApiResponse({
    status: 200,
    description: "Deposit into savingsgoal",
    type: GenericResponse,
  })
  async depositToWallet(@Body() request: DepositDto): Promise<GenericResponse> {
    return (await this.service.depositToWallet(request)) as GenericResponse;
  }

  //Withdraw Savings Goal
  @Post('/withdraw')
  @ApiResponse({
    status: 200,
    description: "Withdraw from savingsgoal",
    type: GenericResponse,
  })
  async withdrawFromWallet(@Body() request: WithdrawalDto): Promise<GenericResponse> {
    return (await this.service.withdrawFromWallet(request)) as GenericResponse;
  }

  //Transfer to Another Bezo Account
  @Post('/transfer')
  @ApiResponse({
    status: 200,
    description: "Transfer to another Bezo Wallet",
    type: GenericResponse,
  })
  async transfer(@Body() request: TransferDto): Promise<GenericResponse> {
    return (await this.service.transfer(request)) as GenericResponse;
  }

  @Post('/checkbalance')
  @ApiResponse({
    status: 200,
    description: "Chick primary Account Balance",
    type: GenericResponse,
  })
  async walletBalance(@Body() request: WalletDto): Promise<GenericResponse> {
    return (await this.service.walletBalance(request)) as GenericResponse;
  }

}

