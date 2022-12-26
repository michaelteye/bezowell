import { Column, Entity } from 'typeorm';

import { AbstractEntity } from './abstract-entity';

@Entity()
export class UserSettingsEntity extends AbstractEntity {
  @Column('boolean', { default: false })
  inappNotifications?: string;

  @Column('boolean', { default: true })
  smsNotifications?: string;

  @Column('boolean', { default: true })
  emailNotifications?: string;
}
