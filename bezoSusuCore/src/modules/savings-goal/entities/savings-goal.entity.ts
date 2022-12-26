import { AccountEntity } from '../../account/entities/account.entity';
import { STATUS } from '../../../../src/modules/auth/entities/enums/status.enum';
import { AbstractEntity } from '../../../../src/modules/main/entities/abstract-entity';
import { DEPOSIT_PREFERENCE } from '../../../../src/modules/main/entities/enums/deposittype.enum';
import { FREQUENCY_TYPE } from '../../../../src/modules/main/entities/enums/savingsfrequency.enum';
import { UserEntity } from '../../../../src/modules/main/entities/user.entity';
import { Entity, ManyToOne, JoinColumn, Column, OneToOne } from 'typeorm';
import { GoalTypeEntity } from './goal-type.entity';
import { GOAL_STATUS } from '../../auth/entities/enums/goal-status.enum';

@Entity()
export class SavingsGoalEntity extends AbstractEntity {
  @OneToOne(() => AccountEntity, (u) => u.savingsGoal, { cascade: true })
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @Column('uuid', { nullable: true })
  accountId?: string;

  @Column('varchar', { nullable: true, length: 100 })
  refNo?: string;

  @ManyToOne(() => GoalTypeEntity, (u) => u.savingsGoals)
  @JoinColumn({ name: 'goalTypeId' })
  goalType?: GoalTypeEntity;

  @Column('uuid')
  goalTypeId?: string;

  @ManyToOne(() => UserEntity, (u) => u.savingsGoals)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('uuid')
  userId: string;

  @Column('text')
  name: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('integer', { default: 0, nullable: false })
  period: number;

  @Column('enum', { enum: FREQUENCY_TYPE })
  frequency: FREQUENCY_TYPE;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: false,
  })
  amountToSave: number;

  @Column('text', { nullable: true })
  emoji?: string;



  @Column('enum', {
    enum: DEPOSIT_PREFERENCE,
    nullable: true,
  })
  preference?: DEPOSIT_PREFERENCE;

  @Column('uuid', { nullable: true })
  autoDeductPaymentMethodId?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountToRaise: number;

  @Column('enum', { enum: GOAL_STATUS } )
  goalStatus: GOAL_STATUS | string

  @Column('boolean', { default: false })
  isFavorite: boolean;

  @Column('date', { nullable: true })
  startDate?: Date;

  @Column('date', { nullable: true })
  endDate?: Date;
}
