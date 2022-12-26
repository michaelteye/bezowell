import { AbstractEntity } from '../../main/entities/abstract-entity';
import { Entity, Column, OneToOne, OneToMany } from 'typeorm';
import { AccountEntity } from './account.entity';
import { ACCOUNT_TYPE_CATEGORY } from 'src/modules/main/entities/enums/accounttypecategory.enum';

// references bezo lock  and flexisave, default Primary wallet
// link account type to wallet

@Entity()
export class AccountTypeEntity extends AbstractEntity {
  @Column('varchar', { nullable: true })
  name?: string;

  @Column('varchar', { nullable: true })
  description?: string;  //Account Type Description

  @Column('varchar', { nullable: true })
  alias?: string;

  @Column('enum', { enum: ACCOUNT_TYPE_CATEGORY, default: ACCOUNT_TYPE_CATEGORY.core_product })
  accountTypeCategory?: ACCOUNT_TYPE_CATEGORY;

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

  @Column('integer', { nullable: true, default: 0 })
  withdrawalStartingCost?: number;

  @Column('integer', { nullable: true, default: 0 })
  withdrawalEndingCost?: number;

  // relationship with account entity

  @OneToMany(() => AccountEntity, (a) => a.accountType)
  accounts?: AccountEntity[];
}
