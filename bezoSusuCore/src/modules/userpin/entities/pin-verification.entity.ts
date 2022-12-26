import { AbstractEntity } from 'src/modules/main/entities/abstract-entity';
import { UserEntity } from 'src/modules/main/entities/user.entity';
import { Column, JoinColumn, Entity, ManyToOne } from 'typeorm';

export enum VERIFICATION_STATUS {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

@Entity()
export class PinVerificationEntity extends AbstractEntity {
  @Column('text')
  verificationId: string;

  @Column('enum', {
    enum: VERIFICATION_STATUS,
    default: VERIFICATION_STATUS.PENDING,
  })
  status: VERIFICATION_STATUS;

  @ManyToOne(() => UserEntity, (user) => user.pinVerifications)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('text')
  userId: string;
}
