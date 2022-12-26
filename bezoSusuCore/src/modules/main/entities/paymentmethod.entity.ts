import { STATUS } from '../../auth/entities/enums/status.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';
import { PAYMENT_TYPE } from './enums/paymenttype.enum';
import { NETWORK } from './enums/network.enum';

@Entity()
export class PaymentMethodEntity extends AbstractEntity {

  @ManyToOne(() => UserEntity, (u) => u.userPaymentMethods, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('text', { nullable: true })
  userId?: string;

  @Column('text', { nullable: true })
  accountNumber?: string;

  @Column({ nullable: true, length: 20 })
  phoneNumber?: string;

  @Column('text', { nullable: true })
  bank?: string;

  @Column('enum', { enum: NETWORK, nullable: true })
  network?: NETWORK;

  @Column('enum', { enum: STATUS, default: STATUS.disabled })
  status: STATUS;

  @Column('enum', { enum: PAYMENT_TYPE, nullable: true })
  paymentType?: PAYMENT_TYPE;


  @Column('boolean', { default: false, nullable: true })
  default?: boolean;
}
