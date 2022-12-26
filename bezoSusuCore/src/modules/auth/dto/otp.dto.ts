import { ApiProperty, OmitType } from '@nestjs/swagger';
import { VerificationType } from '../../enums/verification-type.enum';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsNumber,
  IsEmail,
  ValidateIf,
  IsEnum,
} from 'class-validator';

export class OtpDto {
  @ValidateIf((v) => !v.emal && v.phone_number)
  @IsPhoneNumber('GH')
  @ApiProperty({
    description: 'not needed when email is passed',
    example: '233xxxxxxxx',
    type: String,
    required: false,
  })
  phone?: string;

  @ValidateIf((v) => !v.phone && v.email)
  @IsEmail()
  @ApiProperty({
    description: 'not needed when phone number is passed',
    example: 'example@gmail.com',
    type: String,
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'an otp sent to your phone',
    example: '23456',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  otp: number;

  @IsEnum(VerificationType)
  @ApiProperty({
    description: 'type of verification',
    example: `example  ${VerificationType.REGISTER_USER}, ${VerificationType.PAYMENT}, ${VerificationType.RESET_PASSWORD}`,
    enum: VerificationType,
    required: true,
  })
  verificationType: VerificationType;
}

export class CreateOtpDto extends OmitType(OtpDto, ['otp']) {}
