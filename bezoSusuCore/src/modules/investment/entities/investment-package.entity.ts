import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../main/entities/abstract-entity';
import { InvestmentEntity } from './invest.entity';
//import { InvestmentTypeEntity } from './investment-type.entity';

@Entity()
export class InvestmentPackageEntity extends AbstractEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    nullable: true,
  })
  minAmount?: number;

  @Column('int', { nullable: true, default: 0 })
  rate: number;

  @Column('int', { nullable: true, default: 0 })
  duration: number;

  // link to investment type

  // @ManyToOne(() => InvestmentTypeEntity, (i) => i.investmentPackages)
  // @JoinColumn({ name: 'investmentTypeId' })
  // investmentType?: InvestmentTypeEntity;

  // @Column('uuid', { nullable: false })
  // investmentTypeId: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column('text', { nullable: true })
  name?: string;

  @Column('enum', { name: 'status', enum: STATUS, default: STATUS.active })
  status: STATUS;

  @Column('text', { nullable: true })
  title?: string;

  @Column('text', { nullable: true })
  brief?: string;

  @Column('int', { nullable: true, default: 0 })
  paymentSchedule?: number;

  @ManyToOne(() => InvestmentEntity, (i) => i.packages)
  investment?: InvestmentEntity;

}

// {
//     "_id": "12ac3c43-2963-41d1-9cc7-1a198c16bc52",
//     "minAmount": 500,
//     "rate": 18,
//     "duration": 1,
//     "investmentType_id": "9805959d-e493-43c0-8007-aa3e9e155aa0",
//     "description": "Grow your funds by investing in a 1 - year bond issued by the Government of Ghana. Earn up to 18% per year paid into your BezoWallet every year.This bond is issued by the Government of Ghana and sold by Obsidian Achernar Securities (OASL). OASL is licensed by the Securities and Exchange Commission (SEC) as a broker-dealer. BezoSusu is only a marketing channel.",
//     "name": "Starter",
//     "status": 0,
//     "title": "Invest as a Starter",
//     "brief": "Invest for 1 years and earn up to 18%",
//     "paymentSchedule": "6"
//   }
