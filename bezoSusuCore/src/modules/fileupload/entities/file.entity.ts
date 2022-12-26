import { UserEntity } from '../../../../src/modules/main/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../../../../src/modules/main/entities/abstract-entity';

export enum FILE_TYPE {
  video = 'video',
  document = 'document',
  image = 'image',
}

export enum APP_TYPE {
  PROFILE = 'PROFILE',
  ID_CARD = 'ID_CARD',
  SELFIE = 'SELFIE',
  product = 'product',
  kyc = 'kyc',
}

export enum ID_TYPE {
  GHANA_CARD = 'GHANA_CARD',
  VOTERS_ID = 'VOTERS_ID',
  DRIVER_LICENCE = 'DRIVER_LICENCE',
  PASSPORT = 'PASSPORT',
  NONE = "NONE"
}

@Entity()
export class FileEntity extends AbstractEntity {
  @Column('text', { nullable: true })
  name?: string;

  @Column("text", { array: true, nullable: false })
  url: string[];

  @Column('enum', {
    nullable: false,
    enum: ID_TYPE,
    default: ID_TYPE.NONE,
  })
  idType?: ID_TYPE;

  @Column('text', { nullable: true })
  idNumber?: string;

  @Column('enum', {
    nullable: false,
    enum: FILE_TYPE,
    default: FILE_TYPE.document,
  })
  type: FILE_TYPE;

  @Column('enum', { nullable: false, enum: APP_TYPE, default: APP_TYPE.kyc })
  appType: APP_TYPE;

  @ManyToOne(() => UserEntity, (u) => u.files)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column('uuid', { nullable: false })
  userId: string;


}
