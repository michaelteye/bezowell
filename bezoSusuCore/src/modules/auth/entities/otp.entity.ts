import { OmitType } from '@nestjs/swagger';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { VerificationType } from '../../enums/verification-type.enum';
import { AbstractEntity } from '../../main/entities/abstract-entity';
import { OTP_STATUS } from './enums/otp-status.enum';


@Entity()
export class OtpEntity extends OmitType(AbstractEntity, ['id']) {

  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { nullable: true })
  phone?: string;

  @Column('text', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: false,length:10 })
  otp?: string;

  @Column('enum', { enum: OTP_STATUS, default: OTP_STATUS.not_verified })
  status: OTP_STATUS | string;

  @Column('enum', { enum: VerificationType })
  verificationType: VerificationType;
}
