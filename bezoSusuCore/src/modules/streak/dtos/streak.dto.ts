import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class StreakRecordResponse{
    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description:'containing the user id',
        example:'36747929-23-4-23-4',
        type:String
    })
    userId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
      description: 'Unique transaction  reference',
      example: 'abacd-axk',
      type: String,
    })
    transactionId: string;

        
    @IsBoolean()
    @ApiProperty({
        description: 'Make this goal your favourite',
        example: true,
        type: Boolean,
    })
    streak: boolean;


    @IsString()
    @IsNotEmpty()
    @ApiProperty({
      description: 'Date of transaction',
      example: '2022-12-16',
      type: String,
    })
    createdAt?: String;
}