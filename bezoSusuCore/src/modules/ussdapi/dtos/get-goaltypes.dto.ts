import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class GetGoalTypesDto {


  @IsString()
  @ApiProperty({
    description: 'Mobile Number of Dialer',
    example: '23323445666',
    type: String,
  })
  mobileNumber: string;

 

}
