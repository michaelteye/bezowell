import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class EmailPasswordLoginInput {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: 'The unique email of the user',
    example: 'john.doe@gmail.com',
  })
  readonly email: string;

  @ApiProperty({
    description: 'A password that should be at least 4 characters long',
    example: '2345@$alsdfj48w',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}
