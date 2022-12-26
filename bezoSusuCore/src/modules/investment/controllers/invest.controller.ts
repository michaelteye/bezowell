import {
    Controller,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';

import { MixedAuthGuard } from '../../../../src/modules/auth/guards/mixed-auth.guard';
import {
    RoleAuthGuard,
    RoleAuth,
} from '../../../../src/modules/auth/guards/role-auth.guard';
import { AuthUserRole } from '../../../../src/modules/auth/types/auth-user.roles';
import { InvestService } from '../services/invest.service';
import {
    InvestmentDto,
    InvestmentInputDto
} from '../dtos/invest.dto';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';



@ApiTags('Saving Investments')
@ApiBearerAuth('JWT')
@Controller('users/investment')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class InvestmentController {
    constructor(private service: InvestService) { }

    @RoleAuth(AuthUserRole.User)
    @Post()
    @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
        type: InvestmentDto,
    })
    async create(@Body() request: InvestmentInputDto): Promise<InvestmentDto> {
        return await this.service.create(request);
    }
    



    @RoleAuth(AuthUserRole.User)
    @Get(':id')
    @ApiParam({ name: 'id', required: true, type: String })
    @ApiResponse({
        status: 201,
        type: InvestmentDto,
    })
    async get(@Param() params: any): Promise<InvestmentDto> {
        if (params.id && !isUUID(params.id))
            throw new Error(
                `Invalid id, UUID format expected but received ${params.id}`,
            );
        return (await this.service.get(params.id)) as InvestmentDto;
    }


    // @RoleAuth(AuthUserRole.User)
    // @Put(':id')
    // @ApiResponse({ status: 200, type: InvestmentDto })
    // @ApiParam({ name: 'id', required: true, type: String })
    // async update(
    //     @Body() dto: InvestmentDto,
    //     @Param() params: any,
    // ): Promise<InvestmentDto> {
    //     if (params.id && !isUUID(params.id))
    //         throw new Error(
    //             `Invalid id, UUID format expected but received ${params.id}`,
    //         );
    //     const savingsGoal = await this.service.update(params.id, dto);
    //     return plainToClass(InvestmentDto, savingsGoal);
    // }

  @RoleAuth(AuthUserRole.User)
  @Patch(':id')
  @ApiResponse({ status: 200, type: InvestmentDto })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Body() dto: { name: string },
    @Param() params: any,
  ): Promise<InvestmentDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const investment = await this.service.update(params.id, dto);
    return plainToClass(InvestmentDto, investment);
  }

    @RoleAuth(AuthUserRole.User)
    @Delete(':id')
    @ApiParam({ name: 'id', required: true, type: String })
    @ApiResponse({
        status: 200,
    })
    async delete(@Param() params: any): Promise<void> {
        if (params.id && !isUUID(params.id))
            throw new Error(
                `Invalid id, UUID format expected but received ${params.id}`,
            );
        this.service.delete(params.id);
    }



    @RoleAuth(AuthUserRole.User)
    @Get()
    @ApiResponse({
        status: 201,
        type: [InvestmentDto],
    })
    async getAll(): Promise<InvestmentDto[]> {
        return (await this.service.all()) as InvestmentDto[];
    }
}
