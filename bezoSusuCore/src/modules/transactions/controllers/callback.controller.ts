import { Logger, All, Body, Controller } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionService } from '../services/transaction.service';
import { TransactionEntity } from '../entities/transaction.entity';
import { Repository } from 'typeorm';
import { AccountTransactionEntity } from '../entities/account-transaction.entity';
import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';

@ApiTags('Transactions')
@Controller('transactions')
export class CallBackController {
  private readonly logger = new Logger('Callback Services');
  constructor(private service: TransactionService) {}

  @All('callback')
  @ApiResponse({
    status: 201,
  })
  async callBack(@Body() request: any): Promise<any> {
    this.logger.debug('callBack', JSON.stringify(request, null, 2));
    return await this.service.transactionCallback(request);
  }
}
