import {
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Patch,
  Param,
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
import { GoalTypeService } from '../services/goal-type.service';
import { GoalTypeDto, GoalTypeInputDto } from '../dtos/goal-type.dto';

@ApiTags('AccountType')
@ApiBearerAuth('JWT')
@Controller('admin/account-types')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class GoalTypeController {
  constructor(private service: GoalTypeService) {}

  @RoleAuth(AuthUserRole.User)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: GoalTypeDto,
  })
  async create(@Body() input: GoalTypeInputDto): Promise<GoalTypeDto> {
    return await this.service.create(input);
  }

  @RoleAuth(AuthUserRole.User)
  @Patch(':id')
  @ApiResponse({ status: 200, type: GoalTypeDto })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Body() dto: GoalTypeInputDto,
    @Param() params: any,
  ): Promise<GoalTypeDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const goalType = await this.service.update(params.id, dto);
    return plainToClass(GoalTypeDto, goalType);
  }

  @RoleAuth(AuthUserRole.User)
  @Get(':id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({
    status: 201,
    type: GoalTypeDto,
  })
  async get(@Param() params: any): Promise<GoalTypeDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    return (await this.service.get(params.id)) as GoalTypeDto;
  }

  @RoleAuth(AuthUserRole.User)
  @Get()
  @ApiResponse({
    status: 201,
    type: WalletDto,
  })
  async getAll(): Promise<GoalTypeDto[]> {
    return (await this.service.all()) as GoalTypeDto[];
  }
}
