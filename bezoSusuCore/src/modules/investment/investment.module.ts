import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentEntity } from './entities/invest.entity';
//import { InvestmentTypeEntity } from './entities/investment-type.entity';
import { InvestmentPackageEntity } from './entities/investment-package.entity';
import { InvestPackageController } from './controllers/invest-package.controller';
import { InvestmentController } from './controllers/invest.controller';
import { InvestmentTypeService } from './services/investment-package.service';
import { InvestService } from './services/invest.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestmentEntity,
      //InvestmentTypeEntity,
      InvestmentPackageEntity,
    ]),
  ],
  controllers: [InvestPackageController, InvestmentController],
  providers: [InvestmentTypeService, InvestService],
  exports: [InvestService, InvestmentTypeService]
})
export class InvestmentModule { }
