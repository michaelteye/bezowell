import { InvestmentEntity } from './../entities/invest.entity';
import { EntityManager, Not, Repository } from 'typeorm';
import { InvestmentDto, InvestmentInputDto } from '../dtos/invest.dto';
import { AccountEntity } from '../../../../src/modules/account/entities/account.entity';
import { STATUS } from '../../../../src/modules/auth/entities/enums/status.enum';
import { AppRequestContext } from '../../../../src/utils/app-request.context';
import { getAppContextALS } from '../../../../src/utils/context';
import { GOAL_STATUS } from '../../../../src/modules/auth/entities/enums/goal-status.enum';
import { HttpException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';

import { generateCode } from 'src/utils/shared';
import { WalletTypeEntity } from '../../wallet/entities/wallet.entity';
import { uuid } from 'uuidv4';
import { InvestmentPackageEntity } from '../entities/investment-package.entity';

@Injectable()
export class InvestService {
    constructor(
        @InjectEntityManager('default') private em: EntityManager,

        @InjectRepository(InvestmentEntity)
        private savingsGoalRepository: Repository<InvestmentEntity>,
    ) { }

    async create(input: InvestmentInputDto): Promise<InvestmentDto> {
        const ctx = getAppContextALS<AppRequestContext>();

        if (await this.InvestmentExist(input.name, ctx.authUser.userId)) {
            throw new HttpException('Investment already exist', 400);
        }


        console.log("input", input)

        const account = new AccountEntity();

        account.userId = ctx.authUser.userId;
        account.accountTypeId=input.accountTypeId
        // account.accountNumber = Number(generateCode(10));


        const investmentPackageData = await this.em.findOne(InvestmentPackageEntity, {
            where: { id: input.investmentPackageId },
            // relations: ['user'],
        });

       if (!investmentPackageData) {
            throw new HttpException(
                `Invalid package id`,
                404,
            );
        }

        const accountData = await this.em.findOne(AccountEntity, {
            where: { userId: ctx.authUser.userId },
            // relations: ['user'],
        });

        console.log("accountData", accountData)

        


        const investData = new InvestmentEntity();
        investData.amount = input.amount;
        investData.period = input.period;
        investData.ref = input.ref;
        investData.startDate =
            typeof input.startDate === 'string'
                ? new Date(input.startDate)
                : input.startDate;
        investData.endDate =
            typeof input.endDate === 'string'
                ? new Date(input.endDate)
                : input.endDate;
        investData.userId = ctx.authUser.userId;

        // investData.user = ctx.authUser.user
        investData.investmentPackageId = input.investmentPackageId
        investData.name = input.name
        investData.packages = [investmentPackageData]
        investData.account = accountData
        investData.account_id = accountData.id
        investData.account = accountData


        return this.em.save(investData) as unknown as any;
    }

    async all(): Promise<InvestmentDto[]> {
        const ctx = getAppContextALS<AppRequestContext>();
        const goals = await this.em.find(InvestmentEntity, {
            relations: ['account', 'user', 'packages'],
            where: {
                userId: ctx.authUser.userId,
                // name: Not('Primary'),
                // goalStatus: GOAL_STATUS.inprogress,
                // goalType: { name: Not('Primary'), status: STATUS.active },
            },
        });
        return goals as unknown as InvestmentDto[];
    }

    async get(id: string): Promise<InvestmentDto | InvestmentEntity> {

        const ctx = getAppContextALS<AppRequestContext>();
        return (await this.em.findOne(InvestmentEntity, {
            where: { id: id, userId: ctx.authUser.userId },
            relations: ['account', 'user', 'packages'],
        })) as unknown as InvestmentDto;
    }



  async update(id: string, input: { name: string }): Promise<InvestmentDto> {
    const investment: InvestmentEntity | InvestmentDto = await this.get(id);
    if (!investment) {
      throw new HttpException('AccountType not found', 404);
    }
    investment.name = input.name;
    return this.em.save(investment) as unknown as InvestmentDto;
  }

    // // delete savings goal
    async delete(id: string): Promise<void> {

        try {
            const investData: InvestmentEntity | InvestmentDto = await this.get(id);
            if (!investData) {
                throw new HttpException('investment not found', 404);
            }



            await this.em.delete(InvestmentPackageEntity, { id: investData.investmentPackageId });

            await this.em.delete(InvestmentEntity, id);

        } catch (error) {
            throw new HttpException('Failed to delete', 400);
        }

    }

    // async getDefaultWalletId(): Promise<string> {
    //     return this.em
    //         .findOne(WalletTypeEntity, { where: { name: 'Local' } })
    //         .then((wallet) => wallet.id);
    // }

    async InvestmentExist(name: string, userId: string) {
        return await this.em.findOne(InvestmentEntity, {
            where: { userId: userId, name: name },
        });
    }
}
