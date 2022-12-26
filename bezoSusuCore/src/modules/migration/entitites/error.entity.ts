import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class ErrorEntity {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  error!: any;

  @Column('text', { nullable: true })
  migrationType?: string;

  @Column('text', { nullable: true })
  query?: string;

  @Column('text', { nullable: true })
  detail?: string;

  @Column('text', { nullable: true })
  table?: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    default: {},
  })
  data!: any;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
