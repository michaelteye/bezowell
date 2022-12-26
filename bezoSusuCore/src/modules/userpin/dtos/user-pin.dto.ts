import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class UserPinDto {
  @IsPositive()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @ApiProperty({
    description: 'user pin should be at least 4 characters long',
    example: '12345',
    type: Number,
    required: true,
  })
  userPin: number;
}

export class UpdateUserPinDto extends UserPinDto {
  @IsPositive()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 0 })
  @ApiProperty({
    description: 'otp should be at least 4 characters long',
    example: '12345',
    type: Number,
    required: true,
  })
  otp: number;
}

export class PinVerificationResponseDto {
  @IsNotEmpty()
  @ApiProperty({
    type: Object,
    required: true,
  })
  message?: string;

  @IsNotEmpty()
  @ApiProperty({
    type: Object,
    required: true,
  })
  verificationId?: string;
}

export class PinResponseDto extends OmitType(PinVerificationResponseDto, [
  'verificationId',
]) {
  @IsNotEmpty()
  @ApiProperty({
    type: Object,
    required: true,
  })
  message?: string;
}
