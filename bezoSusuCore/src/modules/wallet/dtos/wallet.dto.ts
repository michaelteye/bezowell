import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';
import { CURRENCY } from '../../../../src/modules/enums/currency.enum';

export class WalletDto {
  @IsString()
  @ApiProperty({
    description: 'wallet name with associated currency',
    example: 'Bezo Cedis Wallet',
    type: String,
    required: true,
  })
  name: string;

  @IsEnum(CURRENCY)
  @ApiProperty({
    enum: CURRENCY,
    enumName: 'CURRENCY',
    example: Object.values(CURRENCY),
    default: CURRENCY.GHS,
  })
  currency: CURRENCY;

  //   @IsArray()
  //   @ApiProperty({
  //     type: [AccountDto],
  //     isArray: true,
  //     example: [AccountDto],
  //   })
  //   accounts: AccountDto[];
}

// export class WalletInputDto extends OmitType(WalletDto, ['accounts']) {}
