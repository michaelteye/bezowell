import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class AccountDto {
  @IsString()
  @ApiProperty({
    description: 'Account name',
    example: 'My Account',
    type: String,
  })
  name: string;

  @IsUUID()
  @ApiProperty({
    description: 'Account type id',
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    type: String,
  })
  accountTypeId: string;

  @IsNumber()
  @ApiProperty({
    description: 'Account number',
    example: 1234567890,
    type: Number,
  })
  accountNumber: number;

  @IsNumber()
  @ApiProperty({
    description: 'Account number',
    example: 1234567890,
    type: Number,
  })
  balance: number;
}
