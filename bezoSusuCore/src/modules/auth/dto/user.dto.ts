import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { GENDER } from '../../enums/gender.enum';
import { DOCUMENT_TYPE } from '../../../../src/modules/main/entities/enums/document.enum';
import { SOCIAL } from '../../enums/social.enum';
import { NETWORK } from '../../transactions/dtos/deposit.dto';
import { fi } from 'date-fns/locale';

export class UserDto {
  @IsOptional()
  @ApiProperty({
    description: 'users default id',
    type: String,
    required: true,
  })
  id?: string;

  @IsOptional()
  @ApiProperty({
    description: 'users first name',
    example: 'Joe',
    type: String,
    required: true,
  })
  firstName?: string;

  @IsOptional()
  @ApiProperty({
    description: 'users last name',
    example: 'Kumbungu',
    type: String,
    required: true,
  })
  lastName?: string;

  @ValidateIf((v) => !v.email && v.phone_number)
  @IsPhoneNumber('GH')
  @ApiProperty({
    description:
      'phone number is optional when email is passed,phone number should start with 233',
    example: '233xxxxxxxx',
    type: String,
    required: false,
  })
  phone_number?: string;

  @ValidateIf((v) => !v.phone && v.email)
  @IsEmail()
  @ApiProperty({
    description: 'email is optional when phone number is passed',
    example: 'example@gmail.com',
    type: String,
    required: false,
  })
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({
    description: 'users passwors should be atleast 8 characters long',
    example: 'Zube284asfl*27&32',
    type: String,
    required: true,
  })
  password: string;

  @IsDateString()
  @IsOptional()
  @ApiProperty({
    description: 'date of birth',
    example: '1990-01-01',
    type: Date,
    required: false,
  })
  dateOfBirth?: Date | string;

  @IsEnum(GENDER)
  @ApiProperty({
    description: 'user gender',
    example: GENDER.male,
    enum: GENDER,
    required: false,
  })
  gender: GENDER;

  @IsOptional()
  @IsEnum(SOCIAL)
  @ApiProperty({
    description: 'where users head about BezoSusu',
    example: SOCIAL.FACEBOOK,
    enum: SOCIAL,
    required: false,
  })
  bezoSource?: SOCIAL;

  @ValidateIf((o) => o.file)
  @IsEnum(DOCUMENT_TYPE)
  @IsOptional()
  @ApiProperty({
    description: 'users document type',
    example: DOCUMENT_TYPE.idPicture,
    enum: [
      DOCUMENT_TYPE.idPicture,
      DOCUMENT_TYPE.proofOfId,
      DOCUMENT_TYPE.profilePicture,
    ],
    required: false,
  })
  documentType?: DOCUMENT_TYPE;

  // street address
  // digital address
  // country
  // region

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'users home address',
    example: 'Number 21 street name , Kasoa, Ghana',
    type: String,
    required: false,
  })
  streetAddress?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'unique user name',
    example: 'pat23new',
    type: String,
    required: false,
  })
  userName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'this is the local ghana post address',
    example: 'GHP-234234-345234',
    type: String,
    required: false,
  })
  digitalAddress?: string;

  @IsOptional()
  @ApiProperty({
    description: 'Ghana country code',
    example: 'GH',
    type: String,
    required: true,
  })
  country?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'users region of residence',
    example: 'Ashanti Region',
    type: String,
    required: false,
  })
  region?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'referral code',
    example: '454535',
    type: String,
    required: false,
  })
  referralCode?: string;

  @ValidateIf((o) => o.DOCUMENT_TYPE)
  @IsOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: false,
    description: 'ID card image upload',
  })
  file?: Express.Multer.File;

  @ApiProperty({
    description: 'momo network',
    example: 'mtn, vodafone, airteltigo',
    type: String,
    required: false,
  })
  network?: string;

  
  
}
