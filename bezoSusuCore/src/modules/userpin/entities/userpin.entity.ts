import { STATUS } from 'src/modules/auth/entities/enums/status.enum';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../../main/entities/abstract-entity';
import { UserEntity } from '../../main/entities/user.entity';

export enum TransactionStatus {
  active = 'active',
  disabled = 'disabled',
}

@Entity()
export class UserPinEntity extends AbstractEntity {
  @Column('text', { select: false })
  pin: string;

  @Column('text', { default: STATUS.disabled })
  status: STATUS;

  @OneToOne(() => UserEntity, (user) => user.pin)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('bool', { default: false })
  updated?: boolean;

  @Column('text')
  userId: string;
}
