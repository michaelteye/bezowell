import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class AccountTypeDto {
  @IsUUID()
  @ApiProperty({
    type: String,
  })
  id: string;

  @IsString()
  @ApiProperty({
    description: 'Account name',
    example: 'My Account',
    type: String,
  })
  name: string;

  @IsNumber()
  @ApiProperty({
    description: 'minimum period with with which money can be withdrawn',
    example: 10,
    type: Number,
  })
  withdrawalPeriod: number;

  @IsNumber()
  @ApiProperty({
    description: 'maximum amount of money that can be withdrawn in a day',
    example: 100,
    type: Number,
  })
  dailyLimit: number;

  @IsNumber()
  @ApiProperty({
    description: 'total amount of money that can be withdrawn in a month',
    example: 100,
    type: Number,
  })
  monthlyLimit: number;

  @IsNumber()
  @ApiProperty({
    description: 'maximum percentage cost of withdrawal',
    example: 100,
    type: Number,
  })
  withdrawalStartingCost: number;

  @IsNumber()
  @ApiProperty({
    description: 'minimum percentage cost of withdrawal',
    example: 100,
    type: Number,
  })
  withdrawalEndingCost: number;
}

export class AccountTypeInputDto extends OmitType(AccountTypeDto, ['id']) {}
