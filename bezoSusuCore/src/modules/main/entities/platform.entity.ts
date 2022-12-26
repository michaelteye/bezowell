import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { PlATFORM } from './enums/platform.enum';
import { UserEntity } from './user.entity';

@Entity()
export class PlatformEntity extends AbstractEntity {
  @Column('enum', { enum: PlATFORM, default: PlATFORM.web })
  name: PlATFORM;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('text')
  userId: string;
}
