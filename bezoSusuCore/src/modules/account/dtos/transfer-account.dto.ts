import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../auth/dto/user.dto';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator';

export class TransferToAccountDto {
  @IsUUID()
  @ApiProperty({
    description: 'Account type id',
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    type: String,
  })
  transferAccountId: string;

  @IsNumber()
  @ApiProperty({
    description: 'Amount to transfer',
    example: 1,
    type: Number,
  })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'pin verification id',
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    type: String,
    required: true,
  })
  verificationId: string;

  @IsOptional()
  @ApiProperty({
    description: 'description of transfer',
    example: 'salary',
    type: String,
    required: true,
  })
  narration?: string;
}

export class AdminTransferToAccountDto {
  @IsPhoneNumber('GH')
  @ApiProperty({
    description: 'Account type id',
    example: '233xxxxxxx',
    type: String,
  })
  phone: string;

  @IsString()
  @ApiProperty({
    description: 'description of transfer',
    example: 'salary',
    type: String,
    required: true,
  })
  narration: string;

  @IsNumber()
  @ApiProperty({
    description: 'Amount to transfer',
    example: 1234567890,
    type: Number,
  })
  amount: number;
}

export class AdminTransferResponseDto {
  @ApiProperty({
    description: 'User Details',
    example: 'User details',
    type: UserDto,
  })
  user: UserDto;

  @IsString()
  @ApiProperty({
    description: 'reference id',
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    type: String,
  })
  reference: string;

  @IsString()
  @ApiProperty({
    description: 'user friendly reference for sms and email notifications',
    example: 'b3d9c1a0-5b9c-4b1d-8c1a-0b9c4b1d8c1a',
    type: String,
  })
  userRef: string;

}
