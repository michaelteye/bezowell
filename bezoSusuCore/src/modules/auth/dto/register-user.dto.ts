import {
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';

import { UserDto } from './user.dto';



export class RegisterUserInputDto extends OmitType(UserDto, ['id']) {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
  })
  occupation: string;

}

export class RegisterResponseDto {
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
  })
  token?: string;

  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
  })
  refreshToken?: string;

  @IsOptional()
  @ApiProperty({
    type: Object,
    required: false,
  })
  message?: { type: string; text: string };
}
