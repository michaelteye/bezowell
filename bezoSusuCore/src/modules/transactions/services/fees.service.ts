import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { Repository, EntityManager } from 'typeorm';
import { DepositInputDto } from '../dtos/deposit.dto';
import { getAppContextALS } from '../../../utils/context';
import { AppRequestContext } from 'src/utils/app-request.context';
import { uuid } from 'uuidv4';
import { gen } from 'n-digit-token';
import { TRANSACTION_STATUS } from 'src/modules/enums/transaction.status';
import { TRANSACTION_TYPE } from 'src/modules/enums/transaction-type.enum';
import { PaymentMethodEntity } from 'src/modules/main/entities/paymentmethod.entity';
import { NETWORK } from 'src/modules/main/entities/enums/network.enum';
import { HttpRequestService } from '../../shared/services/http.request.service';
import {
  AccountTransactionEntity,
} from '../entities/account-transaction.entity';
import { AccountEntity } from '../../account/entities/account.entity';
import { UserPinService } from 'src/modules/userpin/services/userpin.service';
import { AccountService } from '../../account/services/account.service';
import { TransferService } from 'src/modules/transfers/services/transfer.service';
import { AccountDepositWithrawalDto } from 'src/modules/transfers/dto/AccountDepositDto';
import { TRANSFER_STATUS_CODE } from 'src/modules/transfers/enums/transferstatus.enum';
import { NotificationService } from 'src/modules/notifications/services/notification.service';


@Injectable()
export class FeeService extends HttpRequestService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,

    @InjectRepository(PaymentMethodEntity)
    private paymentRepository: Repository<PaymentMethodEntity>,

    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,

    @InjectRepository(AccountTransactionEntity)
    private accountTransactionRepository: Repository<AccountTransactionEntity>,

    private userPinService: UserPinService,

    private accountService: AccountService,
    private transferService: TransferService,
    private notificationService: NotificationService,


    private em: EntityManager,
  ) {
    super();
  }

  async getTransactionStatus(ref: string) {
    const status = await this.em.findOne(TransactionEntity, {
      where: { transactionId: ref },
    });
    if (status) return status;
    throw new HttpException('Transaction not found', 404);
  }

  async userHasEnoughBalance(userId: string, amount: number) {
    const account = await this.getUserDefaultAccount(userId);
    if (account) {
      if (Number(account.balance) >= Number(amount)) return true;
      return false;
    }
    return false;
  }

  async depositWithdrawal(
    input: DepositInputDto,
    type?: TRANSACTION_TYPE,
  ): Promise<any> {
    if (!input.verificationId)
      throw new HttpException('Verification Id is required', 400);
    await this.userPinService.verifyId(input.verificationId);
    const ctx = getAppContextALS<AppRequestContext>();
    const reference = uuid();
    const transaction = new TransactionEntity();
    transaction.amount = input.amount;
    transaction.userId = ctx.authUser.userId;
    transaction.transactionId = reference;
    transaction.userRef = "" + gen(5)
    transaction.transactionStatus = TRANSACTION_STATUS.PENDING;
    transaction.accountId = input.accountId;
    const paymentMethod = await this.getUserPaymentPhone();
    //todo after adding payment method get users payment method by paymentId
    console.log("paymentMethod", paymentMethod)
    if (paymentMethod.phoneNumber) {
      const phoneNumber = paymentMethod.phoneNumber;
      transaction.senderPhone = phoneNumber;
      const network = paymentMethod.network;
      let depositWithdrawalResponse = { message: "", status: "" };
      console.log("type", type)
      if (type === TRANSACTION_TYPE.DEBIT) {
        transaction.transactionType = TRANSACTION_TYPE.WITHDRAWAL;
        const withdrawl = new AccountDepositWithrawalDto();
        withdrawl.amount = input.amount;
        withdrawl.phone = phoneNumber;
        if (transaction.accountId == null) {
          const userAccount = await this.getUserDefaultAccount(transaction.userId);
          transaction.accountId = userAccount.id;
          withdrawl.accountId = userAccount.id;
        } else {
          withdrawl.accountId = transaction.accountId;
        }
        withdrawl.reference = reference;
        withdrawl.narration = "Withdrawal from primary account";
        const debitResponse = await this.transferService.userAccountWithdrawal(withdrawl);
        console.log("debitResponse >>>>", debitResponse)
        if (debitResponse.statusCode == TRANSFER_STATUS_CODE.SUCCESS) {
          //const paymentMode = network === 'airteltigo' ? 'ARITEL_TIGO' : network.toUpperCase();
          const paymentMode = network === 'airteltigo' ? 'ARITEL_TIGO' : network.toUpperCase();
          depositWithdrawalResponse = await this.callPaymentGateWayForDepositWithdrawal(
            phoneNumber,
            input.amount,
            reference,
            type,
            paymentMode,
          );
          console.log("depositWithdrawalResponse", depositWithdrawalResponse)
        } else {
          transaction.transactionStatus = TRANSACTION_STATUS.FAILED;
          depositWithdrawalResponse.message = debitResponse.message;
          depositWithdrawalResponse.status = debitResponse.statusCode;
          const otpSmsResponse = await this.notificationService.sendSms({
            to: ctx.authUser.phone, sms: `Dear Customer,Your withdrawal for GHS${input.amount} failed. Thank you for choosing BezoSusu.`
          })
        }
      } else if (type == TRANSACTION_TYPE.CREDIT) {
        if (transaction.accountId == null) {
          const userAccount = await this.getUserDefaultAccount(transaction.userId);
          transaction.accountId = userAccount.id;
        }
        transaction.transactionType = TRANSACTION_TYPE.DEPOSIT;
        const paymentMode = network === 'airteltigo' ? 'ARITEL_TIGO' : network?.toUpperCase();
        const depositWithdrawalResponse = await this.callPaymentGateWayForDepositWithdrawal(
          phoneNumber,
          input.amount,
          reference,
          type,
          paymentMode,
        );
        if (depositWithdrawalResponse.status === 'PENDING') {
          transaction.senderPhone = phoneNumber;
          transaction.transactionData = depositWithdrawalResponse;
          transaction.narration = "Deposit from primary account";
          this.em.save(transaction);
          return depositWithdrawalResponse;
        }
      }
      transaction.transactionData = depositWithdrawalResponse;
      this.em.save(transaction);

      console.log("depositWithdrawalResponse>>>>12", depositWithdrawalResponse)
      if (depositWithdrawalResponse.status === 'PENDING') {
        transaction.senderPhone = phoneNumber;
        return depositWithdrawalResponse;
      }
      throw new HttpException(depositWithdrawalResponse, 400);
    }
    throw new HttpException('Payment method not found', 404);
  }



  async debitUserPrimaryAccount(amount: number) {
    const ctx = getAppContextALS<AppRequestContext>();
    const hasEnoughBalance = await this.accountService.userHasEnoughBalance(
      ctx.authUser.userId,
      amount,
    );
    if (!hasEnoughBalance) throw new HttpException('Insufficient balance', 400);
    const account = await this.accountService.getUserPrimaryAccount({
      userId: ctx.authUser.userId,
    });
    if (account) {
      const withdrawl = new AccountDepositWithrawalDto();
      withdrawl.amount = amount;
      withdrawl.accountId = account.id;
      withdrawl.reference = uuid();;
      withdrawl.narration = "Withdrawal from primary account";
      this.transferService.userAccountWithdrawal(withdrawl)
    }
    throw new HttpException('Primary Account not found', 404);
  }




  async creditUserPrimaryAccount(amount: number, userId: string) {
    const account = await this.getUserDefaultAccount(userId);
    if (account) {
      const credit = new AccountDepositWithrawalDto();
      credit.amount = amount;
      credit.accountId = account.id;
      credit.reference = uuid();;
      credit.narration = "Deposit to primary account";
      this.transferService.userAccountDeposit(credit)
    }
    throw new HttpException('Primary Account not found', 404);
  }

  async getUserPaymentPhone(network?: NETWORK) {
    const ctx = getAppContextALS<AppRequestContext>();
    const paymentMethod = await this.paymentRepository.findOne({
      where: { userId: ctx.authUser.userId, network },
      //where: { userId: ctx.authUser.userId, ...(network && { network }) },
    });
    if (!paymentMethod)
      throw new HttpException('Payment method not found', 404);
    return paymentMethod;
  }

  async callPaymentGateWayForDepositWithdrawal(
    phone: string,
    amount: number,
    reference: string,
    type: TRANSACTION_TYPE,
    paymentMode: string,
  ) {
    const url = `${this.cfg.payment.url}/${type === TRANSACTION_TYPE.CREDIT ? 'debit' : 'credit'
      }`;
    console.log('environment', process.env.NODE_ENV);
    const data = {
      phoneNumber: phone,
      amount: amount,
      callbackUrl: this.cfg.payment.callbackUrl,
      reference,
      narration: reference,
      paymentMode,
    };
    this.logger.debug(`Initiating ${type} request to ${url}`);
    this.logger.debug(`Request data: ${JSON.stringify(data, null, 2)}`);

    await this.post(url, data);
    this.logger.debug(`Error Response ${JSON.stringify(this.error, null, 2)}`);
    if (this.error) {
      throw new HttpException(this.error, 400);
    }
    this.logger.debug(`Response ${JSON.stringify(this.response, null, 2)}`);
    this.response.reference = reference;
    return this.response;
  }

  async transactionCallback(request: any) {
    const transaction = await this.getTransactionByRef(request.transactionRef);
    if (
      transaction &&
      transaction.transactionStatus === TRANSACTION_STATUS.PENDING
    ) {
      console.log('Updating transaction');
      console.log('Updating transaction full transaction is>>', transaction);
      await this.updateTransaction(request, transaction);
    }
    return 'success';
  }

  async getTransactionByRef(ref: string) {
    return await this.transactionRepository.findOne({
      where: { transactionId: ref },
    });
  }

  async updateTransaction(data, transaction: TransactionEntity) {
    console.log('Updating transaction data>>', data);
    if (transaction && data.status === 'SUCCESS') {
      transaction.transactionStatus = TRANSACTION_STATUS.SUCCESS;
      transaction.transactionData = data;
      await this.transactionRepository.save(transaction);
      if (transaction.transactionType === TRANSACTION_TYPE.DEPOSIT) {
        const deposit = new AccountDepositWithrawalDto();
        deposit.amount = transaction.amount;
        deposit.accountId = transaction.accountId;
        deposit.phone = transaction.senderPhone;
        deposit.reference = transaction.transactionId;
        deposit.narration = "Deposit to primary account";
        this.transferService.userAccountDeposit(deposit);
      }
    } else {
      transaction.transactionStatus = TRANSACTION_STATUS.FAILED;
      this.reverseTransaction(transaction);
    }
    const res = await this.transactionRepository.save(transaction);

    if (res.transactionType == TRANSACTION_TYPE.WITHDRAWAL && res.transactionStatus === TRANSACTION_STATUS.SUCCESS) {
      const otpSmsResponse = await this.notificationService.sendSms({
        to: transaction.senderPhone, sms: `Dear Customer, Your withdrawal for GHS${transaction.amount} was successful. Transaction ID: ${transaction.userRef}. Fee charged: GHS0.00.  Thank you for choosing BezoSusu.`
      })
    } else if (res.transactionType == TRANSACTION_TYPE.WITHDRAWAL && res.transactionStatus === TRANSACTION_STATUS.FAILED) {
      const otpSmsResponse = await this.notificationService.sendSms({
        to: transaction.senderPhone, sms: `Dear Customer,Your withdrawal for GHS${transaction.amount} failed.Thank you for choosing BezoSusu.`
      })
    }
  }

  async reverseTransaction(transaction: TransactionEntity) {
    const userAccount = await this.getUserDefaultAccount(transaction.userId);
    if (transaction.transactionType === TRANSACTION_TYPE.WITHDRAWAL) {
      const reversal = new AccountDepositWithrawalDto();
      reversal.amount = transaction.amount;
      reversal.accountId = userAccount.id;
      reversal.reference = transaction.transactionId;
      reversal.narration = "Reversal: Withrawal from primary account";
      this.transferService.userAccountDeposit(reversal);
      const otpSmsResponse = await this.notificationService.sendSms({
        to: transaction.senderPhone, sms: `Dear Customer,
        Your transaction of GHS${transaction.amount} is reversed.Thank you for choosing BezoSusu.`
      })
    }
    return transaction;
  }


  async getUserDefaultAccount(userId: string) {
    const account = await this.accountRepository.findOne({
      where: { userId, name: 'Primary' },
    });
    return account;
  }

  async getAccountById(accountId: string) {
    const account = await this.accountRepository.findOne({
      where: { id: accountId },
    });
    return account;
  }
}