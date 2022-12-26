import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
} from 'class-validator';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';

export class TransactionHistoryItemDto {
    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Transaction amount',
        example: 1000,
        type: Number,
    })
    amount: number;


    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Account number',
        example: "1010101",
        type: String,
    })
    accountNumber: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'User transaction reference',
        example: "87878",
        type: String,
    })
    userRef?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Phone number reference',
        example: "2332323",
        type: String,
    })
    phone?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Unique transaction  reference',
        example: "abacd-axk",
        type: String,
    })
    transactionId: string;


    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Intial balance before transction',
        example: 1000,
        type: Number,
    })
    initialBalance?: number;


    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Balance after transction',
        example: 1000,
        type: Number,
    })
    currentBalance?: number;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Transaction type Debit or Credit',
        example: `${TRANSACTION_TYPE.DEBIT} or ${TRANSACTION_TYPE.CREDIT}`,
        type: String,
    })
    transactionType: TRANSACTION_TYPE;

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Transaction status',
        example: `${TRANSACTION_STATUS.SUCCESS} or ${TRANSACTION_STATUS.FAILED} or ${TRANSACTION_STATUS.PENDING}`,
        type: String,
    })
    transactionStatus: TRANSACTION_STATUS;


    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Transaction description from user',
        example: "Withdrawal for airtime",
        type: String,
    })
    narration?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Date of transaction',
        example: "2022-12-16",
        type: String,
    })
    transactionDate?: String;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Similar to  transactionDate, Neville wanted this to avoid breaking his app.',
        example: "2022-12-16",
        type: Date,
    })
    createdAt?: Date;

}

export class TransactionHistoryWithCountItemDto {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Array of History',
        example: "",
        type: TransactionHistoryItemDto,
    })
    data?: any[];

    @IsNumber()
    @IsNotEmpty()
    @ApiProperty({
        description: 'Count of data',
        example: "50",
        type: Number,
    })
    count: number;
}

