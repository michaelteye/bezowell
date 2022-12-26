import { HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { EntityManager, Not, Repository } from 'typeorm';
import { GoalTypeDto, GoalTypeInputDto } from '../dtos/goal-type.dto';
import { GoalTypeEntity } from '../entities/goal-type.entity';

export class GoalTypeService {
  @InjectRepository(GoalTypeEntity)
  private goalTypeRepository: Repository<GoalTypeEntity>;
  constructor(private em: EntityManager) {}

  async create(input: GoalTypeInputDto): Promise<GoalTypeDto> {
    const goalType = this.em.create(GoalTypeEntity, input);
    return this.em.save(goalType) as unknown as GoalTypeDto;
  }

  async all(): Promise<any> {
    return await this.goalTypeRepository.find();
  }

  async get(id: string): Promise<GoalTypeDto | GoalTypeEntity> {
     const res=await this.em.findOne(GoalTypeEntity, {
      where: { id: id },
    })

    if(!res){
      throw new HttpException('Goal Type Id not found', 404);

     }

     return res as GoalTypeDto | GoalTypeEntity;
  }

  async update(id: string, input: GoalTypeInputDto): Promise<GoalTypeDto> {
    const goalType: GoalTypeEntity | GoalTypeDto = await this.get(id);
    if (!goalType) {
      throw new Error('AccountType not found');
    }
    goalType.name = input.name;
    return this.em.save(goalType) as unknown as GoalTypeDto;
  }

  async allSavingsGoalTypes(): Promise<GoalTypeDto[]> {
    const goalTypes = await this.goalTypeRepository.find({
      where: { name: Not('Primary'), status: STATUS.active },
    });

    return goalTypes as GoalTypeDto[];
  }
}
