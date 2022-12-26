import { CURRENCY } from '../../../../src/modules/enums/currency.enum';
import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../../main/entities/abstract-entity';
import { AccountEntity } from '../../account/entities/account.entity';

@Entity()
export class WalletTypeEntity extends AbstractEntity {
  @Column('text')
  name: string;

  @Column('enum', { enum: CURRENCY, default: CURRENCY.GHS })
  currency?: CURRENCY;

  @OneToMany(() => AccountEntity, (a) => a.wallet, {
    orphanedRowAction: 'delete',
  })
  accounts?: AccountEntity[];
}
