import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Console, Command } from 'nestjs-console';
import { EntityManager } from 'typeorm';
// import dateFns from 'date-fns';
import { isBefore } from 'date-fns'
import { SavingsGoalEntity } from '../../savings-goal/entities/savings-goal.entity';
import { AccountEntity } from 'src/modules/account/entities/account.entity';
import { GOAL_STATUS } from '../../auth/entities/enums/goal-status.enum';

@Console()
export class MigrateAllowGoalWithdrawCommand {
  private db: Connection;
  constructor(
    private em: EntityManager,
    @InjectConnection() private connection: Connection,
  ) {
    this.db = this.connection.useDb('bezosusuDBLive');
  }

  @Command({
    command: 'migrate:allowgoalwithdraw',
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
    let today = new Date()
    const savingsGolsInProgress = await this.em.createQueryBuilder
    (SavingsGoalEntity,"SavingsGoalEntity").getMany()
    
    console.log('The no of items selected >>' + savingsGolsInProgress.length);
   // return;
   
    if (savingsGolsInProgress.length) {
      for (let k = 0, len = savingsGolsInProgress.length; k < len; k++) {

        console.log("K",k)
        const savingGoal = savingsGolsInProgress[k];
        console.log('The typeof date>>',typeof savingGoal.endDate);
        console.log('The end date>>', savingGoal.endDate);
        console.log('The savings goal end date>>', savingGoal.endDate);
        if (savingGoal.endDate != null ) {
          console.log('The typeof date>>',typeof savingGoal.endDate);
          console.log('The end date>>', savingGoal.endDate);
          const savingGoalDate= new Date(savingGoal.endDate)
        console.log("savingGoalDate",savingGoalDate)
        savingGoalDate.setHours(0, 0, 0, 0);
          if (isBefore(savingGoalDate, today)) {
            console.log('Savings goal end date is before today>>', savingGoal.endDate);
            let account = await this.em.findOne(AccountEntity, { where: { id: savingGoal.accountId } });
            account.allowWithdrawal = true;
            if(savingGoal.goalStatus == GOAL_STATUS.PENDING || savingGoal.goalStatus == GOAL_STATUS.INPROGRESS){
              savingGoal.goalStatus = GOAL_STATUS.COMPLETED;
              console.log("updated account withdrawal")
              await this.em.save(savingGoal);
            }
            await this.em.save(account)
          } else {
            console.log('Savings goal end date is after today>>', savingGoal.endDate);
          }
        } else {
          let account = await this.em.findOne(AccountEntity, { where: { id: savingGoal.accountId } });
          account.allowWithdrawal = true;
          savingGoal.goalStatus = GOAL_STATUS.COMPLETED;
          await this.em.save(account)
          await this.em.save(savingGoal);
        }

      }
    }
    //console.log('The no of items selected >>' + savingsGolsInProgress.length);
  }


}
