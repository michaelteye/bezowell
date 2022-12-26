import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from 'typeorm';

import { AuthUserEntity } from './auth-user.entity';

@Entity()
export class ApiKeyIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  appId: string;

  @Column('text', { unique: true })
  apiKey: string;

  // @OneToOne(() => AuthUserEntity, (o) => o.apiKeyIdentity)
  // @JoinColumn()
  // user: AuthUserEntity;

  // @RelationId('user')
  // readonly userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
