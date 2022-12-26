import { AbstractEntity } from '../../main/entities/abstract-entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AccountTypeEntity } from './account-type.entity';

import { UserEntity } from '../../main/entities/user.entity';
import { WalletTypeEntity } from '../../wallet/entities/wallet.entity';
import { SavingsGoalEntity } from '../../savings-goal/entities/savings-goal.entity';
import { AccountTransactionEntity } from '../../transactions/entities/account-transaction.entity';
import { InvestmentEntity } from '../../investment/entities/invest.entity';
import { TransactionEntity } from '../../transactions/entities/transaction.entity';

@Entity()
export class AccountEntity extends AbstractEntity {
  @Column('text', { nullable: false })
  name: string; 

  @ManyToOne(() => AccountTypeEntity, (a) => a.accounts)
  @JoinColumn({ name: 'accountTypeId' })
  accountType?: AccountTypeEntity;

  @Column('uuid')
  accountTypeId: string;

  @Column('varchar', { nullable: true })
  alias?: string;



  // @Column('text', { nullable: true })
  // account_id?: string;

  @OneToOne(() => SavingsGoalEntity, (a) => a.account, {
    nullable: true,
  })
  savingsGoal?: SavingsGoalEntity;

  // // remove this
  // @Column('uuid', { nullable: true })
  // savingsGoalId?: string;

  @Column('varchar', { nullable: false ,length:20})
  accountNumber: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  balance?: number;

  @ManyToOne(() => UserEntity, (a) => a.accounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => WalletTypeEntity, (w) => w.accounts)
  @JoinColumn({ name: 'walletId' })
  wallet?: WalletTypeEntity;

  @Column('uuid')
  walletId: string;

  @Column('integer', { nullable: true, default: 0 })
  withdrawalPeriod?: number;
 
  @Column('boolean', { nullable: true, default: true })
  allowWithdrawal: boolean;

  @Column('boolean', { nullable: true, default: true })
  allowDeposit: boolean;

  @Column('boolean', { nullable: true, default: true })
  canOverDraw: boolean;

  @Column('integer', { nullable: true, default: 0 })
  dailyLimit?: number;

  @Column('integer', { nullable: true, default: 0 })
  monthlyLimit?: number;

  // @OneToMany(() => DepositEntity, (d) => d.account)
  // deposits?: DepositEntity[];

  @OneToMany(() => InvestmentEntity, (i) => i.account)
  investments?: InvestmentEntity[];

  @OneToMany(() => TransactionEntity, (i) => i.account)
  transactions?: TransactionEntity[];

  @OneToMany(() => AccountTransactionEntity, (a) => a.account)
  accountTransactions?: AccountTransactionEntity[];

  // @OneToMany(() => InterestEntity, (i) => i.account)
  // interests?: InterestEntity[];
}
