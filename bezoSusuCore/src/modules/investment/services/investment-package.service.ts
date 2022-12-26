import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { EntityManager, Not, Repository } from 'typeorm';
import { InvestmentTypeInputDto, InvestmentTypeDto } from '../dtos/investment-package.dto';
import { InvestmentPackageEntity } from '../entities/investment-package.entity';
import { HttpException, Injectable } from '@nestjs/common';

export class InvestmentTypeService {
    @InjectRepository(InvestmentPackageEntity)
    private InvestmentPackageRepository: Repository<InvestmentPackageEntity>;
    constructor(@InjectEntityManager('default') private em: EntityManager,
    ) { }



    async create(input: InvestmentTypeInputDto): Promise<InvestmentTypeDto> {
        const investmentType = this.em.create(InvestmentPackageEntity, input);


        return this.em.save(investmentType) as unknown as InvestmentTypeDto;
    }

    async all(): Promise<any> {
        return await this.InvestmentPackageRepository.find();
    }

    async get(id: string): Promise<InvestmentTypeDto | InvestmentPackageEntity> {
        const res = await this.em.findOne(InvestmentPackageEntity, {
            where: { id: id },
        })
        if(!res){
         throw new HttpException('Package Id not found', 404);

        }

       return res as InvestmentTypeDto | InvestmentPackageEntity;


    }

    async update(id: string, input: InvestmentTypeInputDto): Promise<InvestmentTypeDto> {


        const investPackageToSave: InvestmentPackageEntity | InvestmentTypeDto = await this.get(id);

        if (!investPackageToSave) {
            throw new Error('Investment package not found');
        }
        investPackageToSave.minAmount = input.minAmount;
        investPackageToSave.rate = input.rate;
        investPackageToSave.duration = input.duration;
        investPackageToSave.description = input.description;

        investPackageToSave.title = input.title;
        investPackageToSave.brief = input.brief;



        return this.em.save(investPackageToSave) as unknown as InvestmentTypeDto;
    }

    async delete(id: string): Promise<void> {
        const investPackageToDelete: InvestmentPackageEntity | InvestmentTypeDto = await this.get(id);
        if (!investPackageToDelete) {
            throw new HttpException('Savings Goal not found', 404);
        }
        await this.em.delete(InvestmentPackageEntity, id);
    }

    // async allSavingsGoalTypes(): Promise<InvestmentTypeDto[]> {
    //     const goalTypes = await this.InvestmentPackageRepository.find({
    //         where: { name: Not('Primary'), status: STATUS.active },
    //     });

    //     return goalTypes as InvestmentTypeDto[];
    // }
}
