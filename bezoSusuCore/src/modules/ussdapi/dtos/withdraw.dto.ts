import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';
import { NETWORK } from 'src/modules/transactions/dtos/deposit.dto';



// Deposit
export class WithdrawalDto {


  @IsString()
  @ApiProperty({
    description: 'Mobile Number of Dialer',
    example: '23323445666',
    type: String,
  })
  mobileNumber: string;


  @IsString()
  @ApiProperty({
    description: 'Mobile network of Dialer',
    example: 'MTN',
    type: String,
  })
  network: NETWORK;

  @IsString()
  @ApiProperty({
    description: 'Amount to withdraw',
    example: '10 cedis or more',
    type: String,
  })
  amount: number;


  // Enter Bezo PIN
  @IsNumber()
  @ApiProperty({
    description: 'Enter Bezo PIN',
    example: "Four digit pin",
    type: Number,
  })
  pin: string;


}
