import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID } from 'class-validator';



// Deposit
export class GenericResponse {
    @IsString()
    @ApiProperty({
      description: 'Operaction Status, 00 success, 01 pending, 03 failed',
      example: '00',
      type: String,
    })
    status: string;
  
    @IsString()
    @ApiProperty({
      description: 'Api Response message',
      example: 'Status is success',
      type: String,
    })
    message: string;
 
  }
