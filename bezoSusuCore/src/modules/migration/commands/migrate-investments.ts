import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { JwtManagerService } from 'src/modules/auth/services/jwt-manager.service';
import { PasswordEncoderService } from 'src/modules/auth/services/password-encorder.service';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { EntityManager } from 'typeorm';
import { ErrorEntity } from '../entitites/error.entity';
import { GoalTypeEntity } from '../../savings-goal/entities/goal-type.entity';
import { TRANSACTION_TYPE } from '../../enums/transaction-type.enum';
import { TRANSACTION_STATUS } from '../../enums/transaction.status';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';
import { AccountTransactionEntity } from '../../transactions/entities/account-transaction.entity';
import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { InvestmentPackageEntity } from '../../investment/entities/investment-package.entity';
import { InvestmentEntity } from '../../investment/entities/invest.entity';
import { AccountTypeEntity } from 'src/modules/account/entities/account-type.entity';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { generateCode } from 'src/utils/shared';

@Console()
export class MigrateInvestmentCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    private passwordHash: PasswordEncoderService,
    private readonly jwtManager: JwtManagerService,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:investments',
  })
  async execute(opts?: any) {
    try {
      return await this._execute(opts);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async _execute(opts?: any) {
    console.log('Migration started ...');
    // await this.migrateInvestmentType(),
    await this.migrateInvestmentPackage();
    await this.migrateInvestments();
    console.log('Migration Completed !! ...');
  }

  // load investment

  async getUserInvestments() {
    const investments = await this.db
      .collection('investments')
      .aggregate()
      .lookup({
        from: 'investment_accounts',
        localField: 'investment_account_id',
        foreignField: '_id',
        as: 'account',
      })
      .lookup({
        from: 'investment_packages',
        localField: 'package_id',
        foreignField: '_id',
        as: 'package',
      })
      .toArray();
    return investments;
  }

  async getUserInvestmentTypes() {
    const investmentTypes = await this.db
      .collection('investment_types')
      .find()
      .toArray();
    return investmentTypes;
  }

  async getUserInvestmentPackages() {
    const investmentPackages = await this.db
      .collection('investment_packages')
      .find({ status: STATUS.active })
      .toArray();
    return investmentPackages;
  }

  async migrateInvestments() {
    const investments = await this.getUserInvestments();

    const chunkSize = 1000;
    for (let i = 0; i < investments.length; i += chunkSize) {
      const chunk = investments.slice(i, i + chunkSize);
      await Promise.all([this.createInvestments(chunk)]);
    }
  }

  async createInvestments(data: any[]) {
    for (const item of data) {
      const investment = new InvestmentEntity();
      investment.amount = item.amount;
      investment.period = item.period;
      investment.ref = item.ref;
      if (this.isValidDate(item.startDate))
        investment.startDate = new Date(item.startDate);

      if (this.isValidDate(item.endDate))
        investment.endDate = new Date(item.endDate);

      investment.investmentPackageId = (
        await this.getInvestmentPackageId(item.package[0])
      ).id;

      if (this.isValidDate(item.createdAt))
        investment.createdAt = new Date(item.createdAt);

      investment.userId = await this.getUserId(item.account.user_id);
      investment.account_id = (
        await this.saveAccount(
          await this.mapInvestmentAccount(item.account[0], item.user_id),
        )
      ).id;
      await this.em.save(investment);
    }
  }

  async saveAccount(account: AccountEntity) {
    return await this.em.save(account);
  }

  async mapInvestmentAccount(
    accountData: any,
    userId: string,
  ): Promise<AccountEntity> {
    const account = new AccountEntity();
    const name = 'Investment Account';
    account.name = name;
    if (accountData) {
      const account_type = 'Investment';
      account.accountTypeId = await this.getAccountTypeId(account_type);
      account.accountNumber = this.getAccountNumber(
        accountData.accountNumber
      );
      account.balance = Number(accountData.balance);
      account.userId = await this.getUserId(userId);
      account.walletId = await this.getWalletId();
      return account;
    }
    account.accountTypeId = await this.getAccountTypeId('Primary');
    account.accountNumber = this.getAccountNumber(0); // generate default account number;
    account.balance = 0;
    account.userId = await this.getUserId(userId);
    account.walletId = await this.getWalletId();
    return account;
  }
  async getInvestmentPackageId(item: any) {
    return await this.em.findOne(InvestmentPackageEntity, {
      where: { name: item.name },
    });
  }

  // async migrateInvestmentType() {
  //   const types = await this.getUserInvestmentTypes();

  //   for (const item of types) {
  //     const exist = await this.em.findOne(InvestmentTypeEntity, {
  //       where: { name: item.name },
  //     });
  //     if (!exist) {
  //       const investmentType = new InvestmentTypeEntity();
  //       investmentType.typeId = String(item._id);
  //       investmentType.name = item.name;
  //       investmentType.description = item.description;
  //       investmentType.status = item.status;
  //       investmentType.brief = item.brief;
  //       investmentType.title = item.title;
  //       await this.em.save(investmentType);
  //     }
  //   }
  // }

  async migrateInvestmentPackage() {
    const packages = await this.getUserInvestmentPackages();
    for (const item of packages) {
      const exist = await this.em.findOne(InvestmentPackageEntity, {
        where: { name: item.name },
      });
      if (!exist) {
        const investmentPackage = new InvestmentPackageEntity();
        // investmentPackage.investmentTypeId = await this.getInvestmentTypeId(
        //   item.investmentType_id,
        // );
        investmentPackage.minAmount = item.minAmount;
        investmentPackage.rate = item.rate;
        investmentPackage.duration = item.duration;
        investmentPackage.name = item.name;
        investmentPackage.description = item.description;
        investmentPackage.status = item.status;
        investmentPackage.brief = item.brief;
        investmentPackage.title = item.title;
        investmentPackage.paymentSchedule = item.paymentSchedule;
        await this.em.save(investmentPackage);
      }
    }
  }

  async storeErrorData(data: any, errorType: string) {
    const errorData = new ErrorEntity();
    errorData.data = data.data;
    errorData.migrationType = errorType;
    if (data.error.detail) errorData.detail = data.error.detail;
    if (data.error.table) errorData.table = data.error.table;
    if (data.error.query) errorData.query = data.error.query;
    await this.em.save(errorData);
  }

  async getUserId(id: string) {
    const user = await this.em.findOne(UserEntity, {
      where: { user_id: id },
    });
    if (user) return user.id;
    return null;
  }

  async isValidDate(date: string) {
    const timestamp = Date.parse(date);

    if (isNaN(timestamp) == false) {
      return new Date(timestamp);
    }
    return null;
  }

  getTransactionType(type: string): TRANSACTION_TYPE {
    console.log('type', type);
    console.log('includes', type.includes('credit'));
    if (type.includes('debit')) return TRANSACTION_TYPE.CREDIT;
    if (type.includes('credit')) return TRANSACTION_TYPE.DEBIT;
    return TRANSACTION_TYPE.NOT_SPECIFIED;
  }

  getTransactionStatus(message?: string): TRANSACTION_STATUS {
    if (!message) return TRANSACTION_STATUS.FAILED;
    const formatMessage = message.toLowerCase();
    if (
      formatMessage.includes('successfully') ||
      formatMessage.includes('success')
    )
      return TRANSACTION_STATUS.SUCCESS;
    return TRANSACTION_STATUS.FAILED;
  }

  transactionIsInterest(message: string) {
    if (message.includes('Interest')) return true;
    return false;
  }

  async getTransactionId(ref: string) {
    const transaction = await this.em.findOne(TransactionEntity, {
      where: { transactionId: ref },
    });
    if (transaction) return transaction.id;
    return false;
  }

  async ifRefExist(ref: string) {
    return await this.em.findOne(AccountTransactionEntity, {
      where: { referenceId: ref },
    });
  }

  // async getInvestmentTypeId(id: string) {
  //   const type = await this.em.findOne(InvestmentTypeEntity, {
  //     where: { typeId: id },
  //   });
  //   return type.id;
  // }

  async getAccountTypeId(type?: string) {
    const accountType = await this.em.findOne(AccountTypeEntity, {
      where: { name: type ?? 'Felix Save' },
    });
    return accountType.id;
  }

  async getWalletId() {
    const wallet = await this.em.findOne(WalletTypeEntity, {
      where: { name: 'Local' },
    });
    if (wallet) return wallet.id;
    return null;
  }

  async getGoalTypeId(name: string) {
    const goalType = await this.em.findOne(GoalTypeEntity, {
      where: { name },
    });
    if (goalType) return goalType.id;
    return null;
  }

  getAccountNumber(acc: number) {
    if (acc === 0) return generateCode(10)
    return "" + acc;
  }
}
