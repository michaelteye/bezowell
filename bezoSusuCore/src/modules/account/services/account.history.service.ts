import { Injectable, HttpException, Logger } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { SavingsGoalInputDto } from 'src/modules/savings-goal/dtos/savings-goal.dto';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { AppRequestContext } from 'src/utils/app-request.context';
import { getAppContextALS } from 'src/utils/context';
import { generateCode } from 'src/utils/shared';
import { EntityManager, Repository } from 'typeorm';
import { AccountEntity } from '../entities/account.entity';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import { TransferStatus } from '../../transactions/entities/account-transaction.entity';
import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';

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

@Injectable()
export class AccountService {
  private logger = new Logger('AccountService');
  constructor(
    @InjectEntityManager('default') private em: EntityManager
  ) { }

  async mapAccountFromSavingsGoal(
    input: SavingsGoalInputDto,
  ): Promise<AccountEntity> {
    const ctx = getAppContextALS<AppRequestContext>();
    const account = new AccountEntity();
    account.name = input.name;
    account.accountTypeId = input.accountTypeId;
    account.userId = ctx.authUser.userId;
    account.accountNumber = generateCode(10);
    account.walletId = input.walletId ?? (await this.getDefaultWalletId());
    return account;
  }

  async getDefaultWalletId(): Promise<string> {
    return this.em
      .findOne(WalletTypeEntity, { where: { name: 'Local' } })
      .then((wallet) => wallet.id);
  }



  async getUserPrimaryAccount(user: {
    userId?: string;
    accountId?: string;
  }): Promise<AccountEntity> {
    this.logger.debug('user', user);
    const { userId, accountId } = user;
    const account = await this.em.findOne(AccountEntity, {
      where: {
        ...(user && { userId }),
        ...(accountId && { id: accountId }),
        name: 'Primary',
      },
    });
    if (!account) {
      const errorMessage = user.userId
        ? `id ${userId}`
        : `account id ${accountId}`;
      throw new HttpException(
        `User with  ${errorMessage} has no Primary Account`,
        400,
      );
    }
    return account;
  }

  async userHasEnoughBalance(userId: string, amount: number) {
    const account = await this.getUserPrimaryAccount({ userId });
    if (account) {
      if (Number(account.balance) >= Number(amount)) return true;
      return false;
    }
    return false;
  }


  async getUserBalance(userId: string) {
    const account = await this.getUserPrimaryAccount({ userId });
    if (account) return Number(account.balance);
    return 0;
  }

}
