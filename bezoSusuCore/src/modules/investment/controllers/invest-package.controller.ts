import {
    Controller,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Post,
    Body,
    Patch,
    Put,
    Param,
    Delete,
    Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';
import { plainToClass } from 'class-transformer';
import { isUUID } from 'class-validator';
import { MixedAuthGuard } from '../../../../src/modules/auth/guards/mixed-auth.guard';
import {
    RoleAuthGuard,
    RoleAuth,
} from '../../../../src/modules/auth/guards/role-auth.guard';
import { AuthUserRole } from '../../../../src/modules/auth/types/auth-user.roles';
import { WalletDto } from '../../../../src/modules/wallet/dtos/wallet.dto';
import { InvestmentTypeService } from '../services/investment-package.service';
import { InvestmentTypeDto, InvestmentTypeInputDto } from '../dtos/investment-package.dto';

@ApiTags('Investment Packages')
@ApiBearerAuth('JWT')
@Controller('users/investment-packages')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))

export class InvestPackageController {
    constructor(private service: InvestmentTypeService) { }

    @RoleAuth(AuthUserRole.User)
    @Post()
    @ApiResponse({
        status: 201,
        description: 'The record has been successfully created.',
        type: InvestmentTypeDto,
    })
    async create(@Body() input: InvestmentTypeInputDto): Promise<InvestmentTypeDto> {
        return await this.service.create(input);
    }

    @RoleAuth(AuthUserRole.Admin)
    @Put(':id')
    @ApiResponse({ status: 200, type: InvestmentTypeDto })
    @ApiParam({ name: 'id', required: true, type: String })
    async update(
        @Body() dto: InvestmentTypeInputDto,
        @Param() params: any,
    ): Promise<InvestmentTypeDto> {
        if (params.id && !isUUID(params.id))
            throw new Error(
                `Invalid id, UUID format expected but received ${params.id}`,
            );
        const goalType = await this.service.update(params.id, dto);
        return plainToClass(InvestmentTypeDto, goalType);
    }

    @RoleAuth(AuthUserRole.User)
    @Get(':id')
    @ApiParam({ name: 'id', required: true, type: String })
    @ApiResponse({
        status: 201,
        type: InvestmentTypeDto,
    })
    async get(@Param() params: any): Promise<InvestmentTypeDto> {
        if (params.id && !isUUID(params.id))
            throw new Error(
                `Invalid id, UUID format expected but received ${params.id}`,
            );
        return (await this.service.get(params.id)) as InvestmentTypeDto;
    }

    @RoleAuth(AuthUserRole.Admin)
    @Get()
    @ApiResponse({
        status: 201,
        // type: WalletDto,
    })
    async getAll(): Promise<InvestmentTypeDto[]> {
        return (await this.service.all()) as InvestmentTypeDto[];
    }

    @RoleAuth(AuthUserRole.Admin)
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
}
