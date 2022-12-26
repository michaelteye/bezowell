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

@Console()
export class MigrateAccountCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:accounts',
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

  bezoUsers() {
    const users = [
      'e8d1f260398a3b202ad53e87bc2311714b303e4e',
      'e1a07e6d62bb59ceb9106d8510f3c760cb00aa43',
      'd308121515b204a6e42debd9eb7a5b45c76efe08',
      '138ac5f3c1945c95218c8af5e6291cd1f10b176c',
      '5224e8043ef265408fe82ab684bd0c4830297eab',
      '24ba32b6ce949d5761c451ccc5ce75a48c78ad92',
      '41dbd50b957608041f862739fe0ac4c72a35a3f9',
      'e46a60ac1facd7e0378ac182973058e68cca8598',
      '9999d305555bae808eca26b4b459b6cca75a4ea8',
      '5250b772c3f65166ac2cf00bbe5a7647856763f6',
      'a17bc3fe092aeb229782df1f05775fe17bf31208',
      '04a926271731e4603a7e405108b4d1ba98f0d37c',
      '7c41af50ca491e29e4ab11e7168ed113c05600d7',
      '537e31925cba79503ad6b39aa0a107cd39b232d8',
      '9ed01082e0d7366c7d4a7e6f68314d7571be3e07',
      '3a581b611d35ef221affd5047fd27f6421cadee8',
      'bd756794c382c584a5d1287a7f591616c9446cbb',
      '98d100741280b62c6b734c6b6e653e24b443731f',
      'fa1a703401943a993a536c8eb82656a1435daf0d',
      '3367edc08e435dbc140bcebb896d0d725ea87b97',
      '5bf0e497860189c276b29df0e3897936326957ac',
      '2a12b8a0633662dc37e03a604cd97df1420cab50',
      '460eb80ed86fd377106105036318dd196b84c7ad',
      'f6a4f00ce247dfa4b1aa50a60f7bf01ad9c5076f',
      '5ddbb42961068053a5e13a8fa0bed69d2fa05b66',
    ];
    return users;
  }



  individualUser() {
    const users = [
      '11940fdbc7f346b4a55e4db8e7b6e4f47ef4c326'

    ];
    return users
  }
  async getAccountTypes() {
    const accountTypes = await this.db
      .collection('account_type')
      .find()
      .toArray();
    return accountTypes;
  }


  async migrateSavingsGoals(type?: string) {
    const savingGoals = await this.getSavingsGoals(type);
    console.log("savingGoals", savingGoals)

    //  const ab= await Promise.all(
    //     savingGoals.map(async(r)=>{
    //       const mentity = new MigrationAccountEntity();
    //       mentity.user_id = r.user_id;
    //       mentity.data = r
    //       const migration = await this.em.save(mentity);
    //      return await this.createSavingGoals(r, migration)
    //     })
    //   )

    //   console.log("ab fine",ab)



    for (let i = 0; i < savingGoals.length; i++) {
      const mentity = new MigrationAccountEntity();
      mentity.user_id = savingGoals[i].user_id;
      mentity.data = savingGoals[i];
      const migration = await this.em.save(mentity);
      await this.createSavingGoals(savingGoals[i], migration)
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
    let accountData = item.account[0];
    let accountType = item.account_type[0];
    console.log('The item zero account type >>>', accountType);
    let userId = item.user_id;
    if (accountType.name == 'Primary') {
      let primaryAccount = await this.createUserDefaultAccount(
        accountData,
        accountType,
        userId,
        item.savingGoal
      );
      if (primaryAccount.userId == null) {
        console.log('User Id not found for mongoId >> ' + userId);
        migration.migrated = false;
        migration.error = 'User Id not found for mongoId >> ' + userId;
        await this.em.save(migration);
        return;
      }
      this.em.save(primaryAccount);
      migration.migrated = true;
      await this.em.save(migration);
      return;
    }
    console.log('Savings Goal Account Encounted >>')
    try {
      const savingsGoal = new SavingsGoalEntity();
      savingsGoal.name = item.savingGoalName;
      console.log('The saving goal name >>' + savingsGoal.name);
      savingsGoal.description = item.savingGoalName;
      savingsGoal.account = await this.createUserDefaultAccount(
        accountData,
        accountType,
        userId,
        savingsGoal.name
      );
      savingsGoal.frequency = item.frequencyType
        ? this.getFrequencyType(item.frequencyType)
        : FREQUENCY_TYPE.not_available;
      // savings goal type
      if (item.account_type.length) {
        console.log('Goal Type data>>>', accountType);
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

  async getBezoUsersSavingsGoals() {
    const savingsGoals = await this.db
      .collection('personal_savings')
      .aggregate()
      .match({ user_id: { $in: this.bezoUsers() } })
      .lookup({
        from: 'account',
        localField: 'account_id',
        foreignField: '_id',
        as: 'account',
      })
      .lookup({
        from: 'account_type',
        localField: 'account.account_type_id',
        foreignField: '_id',
        as: 'account_type',
      })
      .toArray();
    return savingsGoals as unknown as any[];
  }

  async getAllUsersSavingsGoals() {
    const savingsGoals = await this.db
      .collection('personal_savings')
      .aggregate()
      .match({ user_id: { $in: this.individualUser() } })
      .lookup({
        from: 'account',
        localField: 'account_id',
        foreignField: '_id',
        as: 'account',
      })
      .lookup({
        from: 'account_type',
        localField: 'account.account_type_id',
        foreignField: '_id',
        as: 'account_type',
      })
      .toArray();

    // console.log("savingsGoals ABET",savingsGoals)
    return savingsGoals as unknown as any[];
  }
  async getSavingsGoals(type?: string): Promise<any[]> {
    if (type === 'bezousers') {
      return await this.getBezoUsersSavingsGoals();
    }
    return await this.getAllUsersSavingsGoals();

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

      console.log("acctType>>>>", acctType)
      // account.accountTypeId = acctType.id;
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

  async getAccountTypeId(type?: string) {
    const accountType = await this.em.findOne(AccountTypeEntity, {
      where: { name: type ?? 'Flexi Save' },
    });
    return accountType.id;
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
    console.log("getGoalTypeId.......", goalType)
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
