import { AbstractEntity } from '../../../../src/modules/main/entities/abstract-entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { SavingsGoalEntity } from './savings-goal.entity';
import { STATUS } from 'src/modules/auth/entities/enums/status.enum';

// mapped to the business goos on the old platform

// change to savings product
@Entity()
export class GoalTypeEntity extends AbstractEntity {
  @Column('text', { nullable: false })
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  type?: string;

  @Column('enum', { enum: STATUS, default: STATUS.active })
  status: STATUS;

  @OneToMany(() => SavingsGoalEntity, (a) => a.goalType)
  savingsGoals?: SavingsGoalEntity[];
}
