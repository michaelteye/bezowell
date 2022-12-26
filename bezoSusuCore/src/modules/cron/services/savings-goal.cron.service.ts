import { InjectEntityManager, InjectRepository } from "@nestjs/typeorm";
import { EntityManager, Repository } from 'typeorm'
// import { SavingsGoalEntity } from "src/modules/savings-goal/entities/savings-goal.entity";
import { SavingsGoalEntity } from "src/modules/savings-goal/entities/savings-goal.entity";
import { Cron } from "@nestjs/schedule";
import { Injectable, Logger } from "@nestjs/common";
import { Module } from "@nestjs/common";
// import { InjectSchedule, Schedule, Timeout} from "nest-schedule";
import { GOAL_STATUS } from 'src/modules/auth/entities/enums/goal-status.enum';
import { isBefore } from 'date-fns';
import { AccountEntity } from "src/modules/account/entities/account.entity";
// import {Injectable} from '@nestjs/common'


Injectable()
export class SavingGoalCronService {
    private readonly logger = new Logger('CronService')
    constructor(

        @InjectEntityManager('default') private em: EntityManager,
        // @InjectRepository(SavingsGoalEntity)
        // private savingGoalRepository: Repository<SavingsGoalEntity>,
        // private accountGoalRepository: Repository<AccountEntity>,
        // @InjectSchedule() private readonly schedule: Schedule
    ) { }


    // creating the cron schedule

    @Cron('*/10 ****')
    runEveryMidnight() {
        console.log()
    }



    async releaseWithdrawalsForCompletedSavingsGoalJob() {
        let today = new Date()
        const savingsGolsInProgress = await this.em.find(SavingsGoalEntity, {
            where: { accountId: GOAL_STATUS.INPROGRESS }
        })
        if (savingsGolsInProgress.length) {
            for (let k = 0, len = savingsGolsInProgress.length; k < len; k++) {
                const savingGoal = savingsGolsInProgress[k];
                if (isBefore(savingGoal.endDate, today)) {
                    let account = await this.em.findOne(AccountEntity, { where: { id: savingGoal.accountId } });
                    account.allowWithdrawal = true;
                    //try
                    // let account = await this.accountGoalRepository.findOne({
                    //     where:{
                    //         id:savingGoal.accountId
                    //     }
                    // })
                    account.allowWithdrawal = true;
                    savingGoal.goalStatus = GOAL_STATUS.COMPLETED;
                    await this.em.save(account)
                    return await this.em.save(savingGoal);

                }
            }
        }

    }

}