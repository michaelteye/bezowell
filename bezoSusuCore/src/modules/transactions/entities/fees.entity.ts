
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { AbstractEntity } from '../../main/entities/abstract-entity';
import { UserEntity } from '../../main/entities/user.entity';
import { TRANSACTION_STATUS } from '../../enums/transaction.status';
import { PlATFORM } from '../../main/entities/enums/platform.enum';
import { TRANSACTION_TYPE } from '../../enums/transaction-type.enum';
import { OmitType } from '@nestjs/swagger';
import { AccountEntity } from '../../account/entities/account.entity';
import { FEE_FORMAT } from 'src/modules/enums/fee-format.enum';
import { FEE_TYPE } from 'src/modules/enums/fee-type.enum';


@Entity()
export class FeesEntity {
    @PrimaryGeneratedColumn('increment', { type: 'bigint' })
    id?: number;

    @Column('enum', {
        enum: FEE_TYPE,
        default: FEE_TYPE.EARLY_WITHDRAWAL,
    })
    feeType: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        nullable: true,
    })
    value: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0,
        nullable: true,
    })
    threshHoldValue: number;

    @Column('enum', {
        enum: FEE_FORMAT,
        default: FEE_FORMAT.PERCENTAGE,
    })
    feeFormat: FEE_FORMAT;

    @Column('enum', {
        enum: FEE_FORMAT,
        default: FEE_FORMAT.PERCENTAGE,
    })
    threshHoldFormat: FEE_FORMAT;


}
