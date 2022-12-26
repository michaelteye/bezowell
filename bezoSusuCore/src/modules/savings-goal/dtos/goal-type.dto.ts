import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GoalTypeDto {
  @IsNotEmpty()
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
}

export class GoalTypeInputDto extends OmitType(GoalTypeDto, ['id']) {
  @IsString()
  @ApiProperty({
    description: 'Account name',
    example: 'My Account',
    type: String,
  })
  name: string;
}
