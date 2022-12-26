import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { AuthUserEntity } from './auth-user.entity';

@Entity({ name: 'refresh_token' })
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => AuthUserEntity, (a) => a.token, { onDelete: 'CASCADE' })
  user: AuthUserEntity;

  @Column('uuid', { nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  token?: string;

  @Column('timestamp without time zone')
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
