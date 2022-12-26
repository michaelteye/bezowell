import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { AccountTypeEntity } from 'src/modules/account/entities/account-type.entity';
import { JwtManagerService } from 'src/modules/auth/services/jwt-manager.service';
import { PasswordEncoderService } from 'src/modules/auth/services/password-encorder.service';

import { UserEntity } from 'src/modules/main/entities/user.entity';
import { WalletTypeEntity } from 'src/modules/wallet/entities/wallet.entity';
import { EntityManager } from 'typeorm';
// import dateFns from 'date-fns';
import { isBefore } from 'date-fns'
import { ErrorEntity } from '../entitites/error.entity';
import { GoalTypeEntity } from '../../savings-goal/entities/goal-type.entity';
import { SavingsGoalEntity } from '../../savings-goal/entities/savings-goal.entity';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { GOAL_STATUS } from '../../auth/entities/enums/goal-status.enum';
import { FREQUENCY_TYPE } from 'src/modules/main/entities/enums/savingsfrequency.enum';
import { generateCode } from '../../../utils/shared';
import { DEPOSIT_PREFERENCE } from 'src/modules/main/entities/enums/deposittype.enum';
import { MigrationAccountEntity } from '../entitites/migration.account.entity';
import { account } from 'src/modules/seeder/data';

@Console()
export class MigrateAccountVolume2Command {
  private db: Connection;
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:sv2',
    options: [
      {
        flags: '--type <type>',
        required: false,
      },
    ],
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
    await this.migrateSavingsGoals(opts?.type);
  }



  async getAccountTypes() {
    const accountTypes = await this.db
      .collection('account_type')
      .find()
      .toArray();
    return accountTypes;
  }


  async migrateSavingsGoals(type?: string) {
    const migrations = await this.getSavingsGoals(type);
    for (let i = 0; i < migrations.length; i++) {
      const savingGoal = migrations[i].data;
      const mentity = migrations[i];
      const migration = await this.em.save(mentity);
      await this.createSavingGoals(savingGoal, migration)
    }
  }
  async createSavingGoals(item: any, migration: MigrationAccountEntity) {
    console.log('The full savings goal item>>>', item);
    if (item.account.length == 0 || item.account_type.length == 0) {
      migration.migrated = false;
      migration.error = 'No account_type or accounts >> ';
      await this.em.save(migration);
      return;
    }

    let accountType = item.account_type[0];
    console.log('The item zero account type >>>', accountType);
    if (accountType.name == 'Primary') {
      migration.migrated = true;
      await this.em.save(migration);
      return;
    }
    console.log('Savings Goal Account Encounted >>', item)
    try {
      const userId = await this.getUserId(item.user_id);
      console.log('User Id found >>>', userId);
      let acctName = item.savingGoalName;
      if (item.account.length) {
        acctName = item.account[0].accountName
      }
      const existing = await this.em.findOne(SavingsGoalEntity, {
        where: { userId: userId, name: acctName }
      });
      if (existing) {
        console.log('Existing saving goal found >>>', userId);
        existing.refNo = item.refNo;
        migration.migrated = true;
        await this.em.save(existing);
        await this.em.save(migration);
        return;
      }
      const savingsGoal = new SavingsGoalEntity();
      savingsGoal.name = item.savingGoal;
      console.log('The saving goal name >>' + savingsGoal.name);
      savingsGoal.description = item.savingGoalName;
      let createdAccount = await this.em.findOne(AccountEntity, {
        where: { userId: userId, name: item.savingGoalName }
      })
      if (createdAccount) {
        savingsGoal.accountId = createdAccount.id;
      } else {
        console.log('The saving goal is not associated with any account');
        migration.migrated = false;
        migration.error = { message: 'The saving goal is not associated with any account' }
        await this.em.save(migration);
        return;
      }
      // savingsGoal.account = await this.createUserDefaultAccount(
      //   accountData,
      //   accountType,
      //   userId,
      //   savingsGoal.name
      // );
      savingsGoal.frequency = item.frequencyType
        ? this.getFrequencyType(item.frequencyType)
        : FREQUENCY_TYPE.not_available;
      if (item.account_type.length) {
        savingsGoal.goalTypeId = await this.getGoalTypeId(
          accountType.name,
        );
      } else {
        savingsGoal.goalTypeId = await this.getGoalTypeId('Other');
      }
      savingsGoal.period = isNaN(Number(item.goalPeriod))
        ? 0
        : item.goalPeriod;
      savingsGoal.preference = DEPOSIT_PREFERENCE.manual;
      if (item.depositPreference) {
        if (item.depositPreference == 'manual') {
          savingsGoal.preference = DEPOSIT_PREFERENCE.manual;
        } else {
          savingsGoal.preference = DEPOSIT_PREFERENCE.automatic;
        }
      }
      savingsGoal.amountToRaise = Number(item.amountToRaise);
      if (item.emoji) savingsGoal.emoji = item.emoji;
      savingsGoal.amountToSave = isNaN(item.amountToSave) ? 0 : item.amountToSave;
      const goalStatus = item.status.toLowerCase();
      savingsGoal.startDate = await this.isValidDate(item.startDate);
      if (goalStatus === 'success') {
        if (isBefore(item.endDate, new Date())) {
          savingsGoal.goalStatus = GOAL_STATUS.COMPLETED;
        } else {
          savingsGoal.goalStatus = GOAL_STATUS.INPROGRESS;
        }
      } else if (goalStatus === 'closed') {
        savingsGoal.goalStatus = GOAL_STATUS.TERMINATED
      } else if (goalStatus === 'failed') {
        savingsGoal.goalStatus = GOAL_STATUS.FAILED
      } else {
        savingsGoal.goalStatus = GOAL_STATUS.PENDING
      }
      savingsGoal.endDate = await this.isValidDate(item.endDate);
      savingsGoal.refNo = item.refNo;
      savingsGoal.isFavorite = item.isFavorite;
      savingsGoal.userId = await this.getUserId(item.user_id);
      console.log('Saving savings Goal >>');
      JSON.stringify(savingsGoal)
      const saved = await this.em.save(savingsGoal);
      console.log('Saved Saving Goal>>', saved);
      migration.migrated = true;
      await this.em.save(migration);
    } catch (error) {
      console.log('There was an error saving saving-goal', error);
      migration.migrated = false;
      migration.error = error;
      await this.em.save(migration);
    }
  }

  async saveGoalType(data: GoalTypeEntity) {
    await this.em
      .findOne(GoalTypeEntity, {
        where: { name: data.name },
      })
      .then(async (goal: any) => {
        if (!goal) {
          await this.em.save(data);
        }
      });
  }


  async getSavingsGoals(type?: string): Promise<MigrationAccountEntity[]> {
    const unmigrated = await this.em.find(MigrationAccountEntity);
    console.log('The total migrations>>' + (unmigrated).length)
    return unmigrated;
  }

  async createUserDefaultAccount(
    accountData: any,
    accountType: any,
    userId: string,
    goalName?: string,
  ): Promise<AccountEntity> {
    const account = new AccountEntity();
    account.name = goalName;
    if (accountData) {
      let acctType = null;
      if (accountType.name == 'Primary') {
        acctType = await this.getPrimaryAccounType();
      } else {
        acctType = await this.getFlexiSaveAccounType()
      }
      account.accountTypeId = acctType.id;
      account.accountNumber = "" + this.getAccountNumber(
        Number(accountData.accountNumber),
      );
      account.canOverDraw = acctType.canOverDraw;
      account.allowDeposit = acctType.allowDeposit;
      account.allowWithdrawal = acctType.allowWithdrawal;
      account.dailyLimit = acctType.dailyLimit;
      account.monthlyLimit = acctType.monthlyLimit;
      account.balance = Number(accountData.balance);
      account.userId = await this.getUserId(userId);
      account.walletId = await this.getWalletId();
      return account;
    }
    const flexiSaveType = await this.getFlexiSaveAccounType();
    account.name = goalName ? goalName : 'Primary';
    account.accountTypeId = flexiSaveType.id;
    account.accountNumber = this.getAccountNumber(0); // generate default account number;
    account.balance = 0;
    account.canOverDraw = flexiSaveType.canOverDraw;
    account.allowDeposit = flexiSaveType.allowDeposit;
    account.allowWithdrawal = flexiSaveType.allowWithdrawal;
    account.monthlyLimit = flexiSaveType.monthlyLimit;
    account.dailyLimit = flexiSaveType.dailyLimit;
    account.userId = await this.getUserId(userId);
    account.walletId = await this.getWalletId();
    return account;
  }

  async storeErrorData(data: any, errorType: string) {
    const errorData = new ErrorEntity();
    errorData.data = data.data;
    errorData.migrationType = errorType;
    if (data.error.detail) errorData.detail = data.error.detail;
    if (data.error.table) errorData.table = data.error.table;
    if (data.error.query) errorData.query = data.error.query;
    errorData.data = JSON.stringify(data.error);

    await this.em.save(errorData);
  }


  async getFlexiSaveAccounType() {
    const accountType = await this.em.findOne(AccountTypeEntity, {
      where: { alias: 'flexi-save' },
    });
    return accountType;
  }

  async getPrimaryAccounType() {
    const accountType = await this.em.findOne(AccountTypeEntity, {
      where: { alias: 'primary' },
    });
    return accountType;
  }

  async getWalletId() {
    const wallet = await this.em.findOne(WalletTypeEntity, {
      where: { name: 'Local' },
    });
    if (wallet) return wallet.id;
    return null;
  }

  async getGoalTypeId(name: string) {
    console.log('Getting with goal name', name);
    const goalType = await this.em.findOne(GoalTypeEntity, {
      where: { name },
    });
    console.log('Got Goal Type ID >>', goalType.id);
    if (goalType) return goalType.id;
    return null;
  }

  async getUserId(id: string) {
    const user = await this.em.findOne(UserEntity, {
      where: { user_id: id },
    });
    if (user) {
      console.log("getUserId returning>>", user.id);
      return user.id;
    }
    console.log("getUserId returning null");
    return null;
  }

  async isValidDate(date: string) {
    const timestamp = Date.parse(date);
    if (isNaN(timestamp) == false) {
      return new Date(timestamp);
    }
    return null;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  getFrequencyType(frequency: string): FREQUENCY_TYPE {
    const toFormat = frequency.toLowerCase();
    const types = Object.values(FREQUENCY_TYPE).map((i) => i.toLowerCase());
    if (types.includes(toFormat)) {
      return this.capitalizeFirstLetter(toFormat) as FREQUENCY_TYPE;
    }
    return FREQUENCY_TYPE.not_available;
  }

  getAccountNumber(acc: number) {
    if (acc === 0) return "" + Number(generateCode(10));
    return acc + "";
  }
}
