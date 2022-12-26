import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';


export class TransferDto {


  @IsString()
  @ApiProperty({
    description: 'Mobile Number of Dialer',
    example: '23323445666',
    type: String,
  })
  mobileNumber: string;

  @IsUUID()
  @ApiProperty({
    description: 'Account type id',
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    type: String,
  })
  transferAccountId: string;

  @IsString()
  @ApiProperty({
    description: 'Amount to withdraw',
    example: '10 cedis or more',
    type: String,
  })
  amount: number;

  @IsString()
  @ApiProperty({
    description: 'description of transfer',
    example: 'salary',
    type: String,
    required: true,
  })
  narration: string;

  // Enter Bezo PIN
  @IsNumber()
  @ApiProperty({
    description: 'Enter Bezo PIN',
    example: "Four digit pin",
    type: Number,
  })
  pin: string;

}