import {
  IsNotEmpty,
  IsString,
  Length,
  IsNumber,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { FREQUENCY_TYPE } from '../../main/entities/enums/savingsfrequency.enum';

export class PersonalSavingsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsString()
  period: string;

  @IsNotEmpty()
  @IsEnum({ enum: FREQUENCY_TYPE, default: FREQUENCY_TYPE.daily })
  frequency: FREQUENCY_TYPE;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  lockSaving: boolean;

  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  emoji?: string;

  @IsNotEmpty()
  @IsString()
  preference: string;

  @IsNotEmpty()
  @IsNumber()
  amountToRaise: number;

  @IsNotEmpty()
  @IsString()
  status: string;

  @IsNotEmpty()
  @IsBoolean()
  isFavorite: boolean;
}
