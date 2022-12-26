import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, isNumber, isNumberString, IsOptional, IsString, IsUUID } from 'class-validator';

export class InvestmentTypeDto {
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
    brief: string;

    @IsString()
    @ApiProperty({
        description: 'Title ',
        example: 'Your pacakge title',
        type: String,
    })
    title: string;

    @IsString()
    @ApiProperty({
        description: 'Description ',
        example: 'Mini Edx fund',
        type: String,
    })
    description: string;



    @ApiProperty({
        type: Number,
    })
    rate: number;


    @ApiProperty({
        type: Number,
    })
    minAmount: number;

    @ApiProperty({
        type: Number,
    })
    duration: number;






    // @isNumberString()
    // @ApiProperty({
    //     description: 'Min amount ',
    //     example: '5',
    //     type: Number,
    // })
    // minAmount: number;




    // @IsString()
    // @ApiProperty({
    //     description: 'Name ',
    //     example: 'name here',
    //     type: String,
    // })
    // name: string;
}

export class InvestmentTypeInputDto extends OmitType(InvestmentTypeDto, ['id']) {
    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'Account name',
        example: 'My Account',
        type: String,
    })
    name: string;

    // @IsString()
    // @ApiProperty({
    //     description: 'Rate ',
    //     example: 'Mini Edx fund',
    //     type: String,
    // })
    // rate: string;
}
