import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../main/entities/user.entity';
import { TRANSACTION_STATUS } from '../../enums/transaction.status';
import { PlATFORM } from '../../main/entities/enums/platform.enum';
import { TRANSACTION_TYPE } from '../../enums/transaction-type.enum';
import { OmitType } from '@nestjs/swagger';
import { AccountEntity } from '../../account/entities/account.entity';



@Entity()
export class TransactionEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id?: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  amount?: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('uuid')
  userId: string;

  @Column('text')
  transactionId: string;

  @Column({ nullable: true, length: 100 })
  userRef?: string;

  @Column('text', { nullable: true })
  senderPhone?: string;

  @Column('text', { nullable: true })
  recipientPhone?: string;

  @Column('uuid', { nullable: true })
  fromAccountId: string;

  @Column('uuid', { nullable: true })
  toAccountId: string;

  @Column('text', { nullable: true })
  narration?: string;

  // @Column('uuid', { nullable: true })
  // accountTransferId?: string;

  @Column('enum', {
    enum: TRANSACTION_STATUS,
    default: TRANSACTION_STATUS.PENDING,
  })
  transactionStatus: TRANSACTION_STATUS;

  @Column('enum', {
    enum: PlATFORM,
    default: PlATFORM.web,
  })
  platform: PlATFORM;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  public transactionData?: any;

  // @OneToMany(() => AccountTransactionEntity, (t) => t.transaction)
  // accountTransactions?: AccountTransactionEntity[];

  @Column('enum', { enum: TRANSACTION_TYPE, nullable: false })
  transactionType: TRANSACTION_TYPE;

  @ManyToOne(() => AccountEntity, (a) => a.transactions)
  @JoinColumn({ name: 'accountId' })
  account: AccountEntity;

  @Column('uuid', { nullable: true })
  accountId: string;

  // @OneToOne(() => InterestEntity, (i) => i.transaction)
  // interest?: InterestEntity;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
