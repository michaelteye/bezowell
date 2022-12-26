import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';



// Deposit
export class WalletDto {
    @IsString()
    @ApiProperty({
      description: 'Operation Type',
      example: 'Check balance or Change PIN',
      type: String,
    })
    operationType: string;
  
    @IsString()
    @ApiProperty({
      description: 'Mobile Number of Dialer',
      example: '23323445666',
      type: String,
    })
    mobileNumber: string;

    @IsString()
    @ApiProperty({
      description: 'Select Account/Goal Type',
      example: 'Fees, Rent, Emergency, Business',
      type: String,
    })
    goalType: string;
    
    // Enter Bezo PIN
    @IsNumber()
    @ApiProperty({
      description: 'Enter Bezo PIN',
      example: "Four digit pin",
      type: Number,
    })
    pin: string;

  }
