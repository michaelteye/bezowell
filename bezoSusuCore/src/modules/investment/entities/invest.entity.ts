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

// {
//     "_id": "15e5e4b1-f811-4a73-ad14-5a86dddb2744",
//     "amount": 1000,
//     "period": 5,
//     "ref": "500015",
//     "startDate": "2022-06-27",
//     "endDate": "2023-06-27",
//     "user_id": "41dbd50b957608041f862739fe0ac4c72a35a3f9",
//     "investment_account_id": "0dec0be9-647f-44a9-9be1-80a7aacbf21e",
//     "status": "active",
//     "package_id": "73417af7-b2e7-4a57-8d58-689b1a0e7109",
//     "createdAt": {
//       "$date": {
//         "$numberLong": "1656339810888"
//       }
//     },
//     "updatedAt": {
//       "$date": {
//         "$numberLong": "1656339810888"
//       }
//     }
//   }
