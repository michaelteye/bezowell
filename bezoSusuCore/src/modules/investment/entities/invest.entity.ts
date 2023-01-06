import { UserEntity } from 'src/modules/main/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../main/entities/abstract-entity';
import { AccountEntity } from '../../account/entities/account.entity';
import { STATUS } from '../../auth/entities/enums/status.enum';
import { InvestmentPackageEntity } from './investment-package.entity';

@Entity()
export class InvestmentEntity extends AbstractEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  amount?: number;

  @Column('int', { nullable: true, default: 0 })
  period: number;

  @Column('text', { nullable: false })
  ref: string;

  @Column('text', { nullable: false })
  name: string;


  @Column('date', { nullable: false })
  startDate: Date;

  @Column('date', { nullable: false })
  endDate: Date;

  @ManyToOne(() => UserEntity, (a) => a.investments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column('uuid', { nullable: false })
  userId: string;

  // @ManyToOne(() => AccountEntity, (a) => a.investments, { onDelete: 'CASCADE' })
  // @JoinColumn({ name: 'account_id' })
  // account?: AccountEntity;

@ManyToOne(() => AccountEntity, (a) => a.investments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account?: AccountEntity;

  @Column('uuid', { nullable: true })
  account_id?: string;

  @Column('enum', {
    name: 'status',
    enum: STATUS,
    default: STATUS.active,
  })
  status: string;


  

  @OneToMany(() => InvestmentPackageEntity, (i) => i.investment, {
    cascade: true,
  })

  // @ManyToOne(() => InvestmentPackageEntity, (i) => i.investment, {
  //   cascade: true,
  // })

  
  @JoinColumn({ name: 'investmentPackageId' })
  packages?: InvestmentPackageEntity[];

  @Column('uuid', { nullable: true })
  investmentPackageId?: string;

  // link investment package
}

