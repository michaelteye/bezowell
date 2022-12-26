import { STATUS } from '../../auth/entities/enums/status.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { ACCOUNTTYPE } from './enums/accounttype.enum';
// import { PersonalSavingsEntity } from './personalSavings.entity';
import { UserEntity } from './user.entity';

@Entity()
export class UserAccountEntity extends AbstractEntity {
  @Column('text', { nullable: true })
  name: string;

  @Column('int')
  accountNumber: number;

  // set type to enum
  @Column('enum', { enum: ACCOUNTTYPE, default: ACCOUNTTYPE.primary })
  accountType: ACCOUNTTYPE;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalSavings: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWithdrawal: number;

  // @OneToMany(() => PersonalSavingsEntity, (p) => p.account)
  // personalSavings?: PersonalSavingsEntity[];

  @Column({ type: 'boolean', default: false })
  acceptInterest: boolean;

  @ManyToOne(() => UserEntity, (u) => u.accounts)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('uuid')
  userId: string;

  @Column('enum', { enum: STATUS, default: STATUS.disabled })
  status: STATUS;
}
