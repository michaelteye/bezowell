import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';

@Entity()
export class AddressEntity extends AbstractEntity {
  @Column('text', { nullable: true })
  homeAddress?: string;

  @Column('text', { nullable: true })
  country?: string;

  @Column('text', { nullable: true })
  region?: string;

  @Column('text', { nullable: true })
  gpsAddress?: string;

  @OneToOne(() => UserEntity, (user) => user.address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column('uuid')
  userId?: string;
}
