import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';
import { TransferStatus } from '../entities/account-transaction.entity';

export type TransactionHistory = {
  amount: number;
  accountId?: string;
  narration?: string;
  transactionType: TRANSACTION_TYPE;
  userId?: string;
  initialBalance: number;
  currentBalance: number;
  debitCreditType?: TRANSACTION_TYPE;
  transactionStatus: TRANSACTION_STATUS;
  transferStatus: TransferStatus;
  reference: string;
};
