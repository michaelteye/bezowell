import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';


export class TransactionHistoryRequest {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Start Date',
    example: "2022-12-22",
    type: String,
    required: true,
  })
  startDate: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Start Date',
    example: "2022-12-22",
    type: String,
    required: true,
  })
  endDate: string;


  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Account id',
    example: 'if you pass empty or null string it will default to primary account',
    type: String,
    required: false,
  })
  accountId?: string;


}

export class SavingsGoalTransactionHistoryRequest extends OmitType(TransactionHistoryRequest, [
  'accountId'
]) {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Savings Goal ID',
    example: '',
    type: String,
    required: false,
  })
  savingsGoalId?: string;

}