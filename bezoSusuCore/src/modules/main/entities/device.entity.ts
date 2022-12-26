import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { AbstractEntity } from './abstract-entity';

import { UserEntity } from './user.entity';

@Entity()
export class DeviceEntity extends AbstractEntity {
  @Column('text', { nullable: true })
  name?: string;

  @Column('text', { nullable: true })
  deviceType?: string;

  @Column('text', { nullable: true })
  deviceId?: string;

  @ManyToOne(() => UserEntity, (user) => user.devices)
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column('uuid', { nullable: true })
  userId?: string;
}
