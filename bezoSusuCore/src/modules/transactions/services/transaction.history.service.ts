import { Injectable, HttpException } from '@nestjs/common';
import { EntityManager, Between } from 'typeorm';
import { getAppContextALS } from '../../../utils/context';
import { AppRequestContext } from 'src/utils/app-request.context';
import { HttpRequestService } from '../../shared/services/http.request.service';
import {
  AccountTransactionEntity
} from '../entities/account-transaction.entity';
import { AccountEntity } from '../../account/entities/account.entity';
import { AccountService } from '../../account/services/account.service';
import { TransactionHistoryItemDto, TransactionHistoryWithCountItemDto } from '../dtos/transactionhistoryitem.dto';
import { format as formatDate } from 'date-fns';
import { SavingsGoalService } from 'src/modules/savings-goal/services/savings-goal.service';
import { SavingsGoalTransactionHistoryRequest, TransactionHistoryRequest } from '../dtos/transactionhistoryrequest.dto';
import { TransactionEntity } from '../entities/transaction.entity';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
@Injectable()
export class TransactionHistoryService extends HttpRequestService {
  constructor(
    private savingsGoalService: SavingsGoalService,
    private accountService: AccountService,
    private em: EntityManager,
  ) {
    super();
  }


  async getAccountHistoryByAccountId(accountId: string, itemsPerPage: number, pageNumber: number, transactionType?: string): Promise<TransactionHistoryItemDto[]> {
    let history: AccountTransactionEntity[] = [];
    if (transactionType) {
      history = await this.em.createQueryBuilder(AccountTransactionEntity, 'e')
        .where('e.accountId = :accountId', { accountId })
        .andWhere('e."transactionType" = :transactionType', { transactionType: transactionType })
        .skip((pageNumber - 1) * itemsPerPage)
        .take(itemsPerPage)
        .getMany();
    } else {
      history = await this.em.createQueryBuilder(AccountTransactionEntity, 'e')
        .where('e.accountId = :accountId', { accountId })
        .skip((pageNumber - 1) * itemsPerPage)
        .take(itemsPerPage)
        .getMany();
    }
    const account = await this.em.findOne(AccountEntity, {
      where: { id: accountId },
    });
    console.log('pageNumber>>' + pageNumber);
    console.log('itemsPerPage>>' + itemsPerPage);
    console.log('accountId>>' + accountId);

    const response: TransactionHistoryItemDto[] = [];
    for (let k = 0; k < history.length; k++) {
      var dto = new TransactionHistoryItemDto();
      const hitem = history[k];
      dto.accountNumber = account.accountNumber;
      dto.amount = hitem.amount;
      dto.currentBalance = hitem.currentBalance;;
      dto.initialBalance = hitem.initialBalance;
      dto.narration = hitem.narration;;
      dto.phone = hitem.phone;
      dto.transactionStatus = hitem.transactionStatus;
      dto.userRef = hitem.userRef;
      dto.transactionId = hitem.transactionId;
      dto.transactionType = hitem.transactionType;
      dto.transactionDate = "" + hitem.createdAt;//formatDate(hitem.createdAt, 'yyyy-MM-dd');
      dto.createdAt = hitem.createdAt;
      response.push(dto);
    }
    return response;

  }

  async getAccountHistoryByUserId(userId, pageNumber: number, itemsPerPage: number, type: string): Promise<TransactionHistoryWithCountItemDto> {

    console.log("itemsPerPage", itemsPerPage, "pageNumber", pageNumber)
    var retVal = new TransactionHistoryWithCountItemDto();
    if (type == 'all') {
      retVal.data = await this.em.createQueryBuilder(TransactionEntity, 'e')
        .where('e.userId = :userId ', { userId })
        .skip((pageNumber - 1) * itemsPerPage)
        .orderBy("id", "DESC")
        .take(itemsPerPage)
        .getMany();
      retVal.count = await this.em.count(TransactionEntity, {
        where: { userId: userId, }
      });
      retVal.data = this.translateToHistoryDto(retVal.data)
    } else {
      console.log("type", type)
      if (type.toUpperCase() == TRANSACTION_TYPE.DEPOSIT || type.toUpperCase() == TRANSACTION_TYPE.WITHDRAWAL) {
        retVal.data = await this.em.createQueryBuilder(TransactionEntity, 'e')
          .where('e.userId = :userId AND e.transactionType = :type', { userId, type: type.toUpperCase() })
          .skip((pageNumber - 1) * itemsPerPage)
          .orderBy("id", "DESC")
          .take(itemsPerPage)
          .getMany();
        retVal.count = await this.em.count(TransactionEntity, {
          where: { userId: userId, transactionType: type.toUpperCase() as TRANSACTION_TYPE }
        });
        retVal.data = this.translateToHistoryDto(retVal.data);
      } else {
        throw new HttpException('type is either deposit or withdrawal', 404);
      }
    }
    return retVal;
  }

  async getAccountHistoryByAccountIdDateRange(input: TransactionHistoryRequest): Promise<TransactionHistoryItemDto[]> {
    let account: AccountEntity = null;
    if (input.accountId == null || input.accountId == '') {
      const ctx = getAppContextALS<AppRequestContext>();
      account = await this.accountService.getUserPrimaryAccount({
        userId: ctx.authUser.userId,
      });
      input.accountId = account.id;
    }
    const history = await this.em.createQueryBuilder(AccountTransactionEntity, 'e')
      .where('e."createdAt" BETWEEN :startDate AND :endDate', { startDate: input.startDate, endDate: input.endDate })
      .andWhere('e."accountId" = :accountId', { accountId: input.accountId })
      .getMany();
    const response: TransactionHistoryItemDto[] = [];
    for (let k = 0; k < history.length; k++) {
      var dto = new TransactionHistoryItemDto();
      const hitem = history[k];
      dto.accountNumber = account.accountNumber;
      dto.amount = hitem.amount;
      dto.currentBalance = hitem.currentBalance;;
      dto.initialBalance = hitem.initialBalance;
      dto.narration = hitem.narration;;
      dto.phone = hitem.phone;
      dto.transactionStatus = hitem.transactionStatus;
      dto.userRef = hitem.userRef;
      dto.transactionId = hitem.transactionId;
      dto.transactionType = hitem.transactionType;
      dto.transactionDate = "" + hitem.createdAt;// formatDate(hitem.createdAt, 'yyyy-MM-dd');
      dto.createdAt = hitem.createdAt;
      response.push(dto);
    }
    return response;
  }

  private translateToHistoryDto(history: TransactionEntity[]) {
    const response: TransactionHistoryItemDto[] = [];
    for (let k = 0; k < history.length; k++) {
      var dto = new TransactionHistoryItemDto();
      const hitem = history[k];
      // dto.accountNumber = hitem.accountNumber;
      dto.amount = hitem.amount;
      // dto.currentBalance = hitem.currentBalance;;
      // dto.initialBalance = hitem.initialBalance;
      dto.narration = hitem.narration;;
      dto.phone = hitem.senderPhone;
      dto.transactionStatus = hitem.transactionStatus;
      dto.userRef = hitem.userRef;
      dto.transactionId = hitem.transactionId;
      dto.transactionType = hitem.transactionType;
      dto.transactionDate = "" + hitem.createdAt; //formatDate(hitem.createdAt, 'yyyy-MM-dd');
      dto.createdAt = hitem.createdAt;
      response.push(dto);
    }
    return response;
  }

  async getSavingsGoalTransactionHistoryByDate(input: SavingsGoalTransactionHistoryRequest): Promise<TransactionHistoryItemDto[]> {
    const goal = await this.savingsGoalService.getSavingsGoalById(input.savingsGoalId);
    if (goal) {
      var historyRequest = new TransactionHistoryRequest();
      historyRequest.startDate = input.startDate;
      historyRequest.endDate = input.endDate;;
      historyRequest.accountId = goal.accountId;
      return this.getAccountHistoryByAccountIdDateRange(historyRequest);
    }
    throw new HttpException('Savings goal not found', 404);
  }

  async getPrimaryAccountTransactionHistory(itemsPerPage: number, pageNumber: number): Promise<TransactionHistoryWithCountItemDto> {
    const ctx = getAppContextALS<AppRequestContext>();
    const primaryAccount = await this.accountService.getUserPrimaryAccount({
      userId: ctx.authUser.userId,
    });
    var retVal = new TransactionHistoryWithCountItemDto();
    if (primaryAccount) {
      retVal.data = await this.getAccountHistoryByAccountId(primaryAccount.id, itemsPerPage, pageNumber);
      retVal.count = await this.em.count(AccountTransactionEntity, {
        where: { accountId: primaryAccount.id }
      });
      return retVal;
    }
    throw new HttpException('Primary Account not found', 404);
  }

  async getTransactionsFromAllUserAccounts(pageNumber: number, itemsPerPage: number, type: string): Promise<TransactionHistoryWithCountItemDto> {
    if (!pageNumber) {
      throw new HttpException('pageNumber is required', 400);
    }
    if (!itemsPerPage) {
      throw new HttpException('itemsPerPage is required', 400);
    }
    if (!type || type == '') {
      throw new HttpException('type is required', 400);
    }
    const ctx = getAppContextALS<AppRequestContext>();
    return this.getAccountHistoryByUserId(ctx.authUser.userId, Number(pageNumber), Number(itemsPerPage), type);
  }




  async getSavingsGoalTransactionHistory(savingsGoalId: string, itemsPerPage: number, pageNumber: number, type: string): Promise<TransactionHistoryWithCountItemDto> {
    const goal = await this.savingsGoalService.getSavingsGoalById(savingsGoalId);
    if (goal) {
      var retVal = new TransactionHistoryWithCountItemDto();
      if (type == 'all') {
        retVal.data = await this.getAccountHistoryByAccountId(goal.accountId, itemsPerPage, pageNumber);
        retVal.count = await this.em.count(AccountTransactionEntity, {
          where: { accountId: goal.accountId }
        });
      } else {
        console.log("type", type)
        if (type.toLowerCase() === "debit") {
          retVal.data = await this.getAccountHistoryByAccountId(goal.accountId, itemsPerPage, pageNumber, TRANSACTION_TYPE.DEBIT);
          retVal.count = await this.em.count(AccountTransactionEntity, {
            where: { accountId: goal.accountId, transactionType: TRANSACTION_TYPE.DEBIT }
          });
        } else if (type.toLowerCase() === "credit") {
          retVal.count = await this.em.count(AccountTransactionEntity, {
            where: { accountId: goal.accountId, transactionType: TRANSACTION_TYPE.CREDIT }
          });
          retVal.data = await this.getAccountHistoryByAccountId(goal.accountId, itemsPerPage, pageNumber, TRANSACTION_TYPE.CREDIT);
        }
      }
      return retVal;
    }
    throw new HttpException('Savings goal not found', 404);
  }

}