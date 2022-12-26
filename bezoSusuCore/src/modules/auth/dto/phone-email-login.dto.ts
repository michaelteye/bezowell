import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  ValidateIf,
  IsOptional,
} from 'class-validator';

export class PhoneEmailPasswordLoginInputDto {
  @ValidateIf((o) => o.email == undefined || o.phone)
  @IsPhoneNumber('GH')
  @IsNotEmpty()
  @ApiProperty({
    description:
      'you can use either phone or email but not both at the same time, users phone number should start with 233',
    example: '233xxxxxxxx',
    type: String,
    required: false,
  })
  phone?: string;

  @ValidateIf((o) => o.phone == undefined || o.email)
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description:
      'you can either use your email or phone number but not both at the same time',
    example: 'example@gmail.com',
    type: String,
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'A password that should be at least 4 characters long',
    example: '2345@$alsdfj48w',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsOptional()
  @ApiProperty({
    description: 'user device id',
    example: '',
    required: false,
  })
  @IsString()
  readonly deviceId: string;
}

export class ResetPasswordDto extends OmitType(
  PhoneEmailPasswordLoginInputDto,
  ['deviceId'],
) {}

export class ChangePasswordDto extends OmitType(
  PhoneEmailPasswordLoginInputDto,
  ['deviceId'],
) {

  @ApiProperty({
    description: 'Old Password',
    example: '*****',
    required: true,
  })
  @IsNotEmpty()
  oldPassword: string;

}

export class ResponseDto {
  @ApiProperty({
    description: 'response message',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
