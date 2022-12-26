import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class NotificationDto {
  @ApiProperty({
    description: 'title of the notification',
    example: 'title',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({
    description: 'message of the notification',
    example: 'message',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly message: string;
}
