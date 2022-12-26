 import { UserEntity } from '../../../modules/main/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserInterface } from '../interfaces/user.interface';
import { AuthUserRole } from '../types/auth-user.roles';
import { RefreshTokenEntity } from './refresh-token.entity';
import { STATUS } from './enums/status.enum';
import { IdentityInterface } from '../interfaces/identity.interface';

@Entity()
export class AuthUserEntity implements UserInterface,IdentityInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { nullable: false, array: true, default: '{}' })
  roles?: AuthUserRole[];

  @Column('text', { nullable: true })
  password: string;

  // Profiles
  @OneToOne(() => UserEntity, (user) => user.authUser, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user?: UserEntity;

  @Column('uuid', { nullable: true })
  userId?: string;

  @Column( { nullable: true ,length:200})
  email: string;

  @Column('boolean', { default: false })
  emailValidated?: boolean;

  @Column(  { nullable: true,length:20 })
  phone: string;

  @Column('boolean', { default: false })
  phoneValidated?: boolean;

  @OneToOne(() => RefreshTokenEntity, (o) => o.user, {
    cascade: true,
    nullable: true,
  })
  token?: RefreshTokenEntity;

  @Column('enum', { enum: STATUS, default: STATUS.disabled })
  accountStatus?: STATUS;

  @Column( { nullable: true,type: 'timestamptz' })
  lastLoginDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
