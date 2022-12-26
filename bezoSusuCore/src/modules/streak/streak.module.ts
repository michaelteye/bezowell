import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreakService } from "./service/streak.service";
import { StreakController } from "./controller/streak.controller";
import { HttpModule } from '@nestjs/axios';
// import { AuthModule } from '../auth/auth.module';

export const Entities = [
    TransactionEntity
];

@Module({
    imports: [
        TypeOrmModule.forFeature(Entities),
        HttpModule
    ],
    controllers: [StreakController],
    providers:[StreakService],
    exports: [ TypeOrmModule.forFeature(Entities), StreakService]
})
export class StreakModule { }
