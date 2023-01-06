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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';

import { MixedAuthGuard } from '../../../../src/modules/auth/guards/mixed-auth.guard';
import {
  RoleAuthGuard,
  RoleAuth,
} from '../../../../src/modules/auth/guards/role-auth.guard';
import { AuthUserRole } from '../../../../src/modules/auth/types/auth-user.roles';
import { SavingsGoalService } from '../services/savings-goal.service';
import { SavingsGoalDto, SavingsGoalInputDto } from '../dtos/savings-goal.dto';
import { isUUID } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { GoalTypeDto } from '../dtos/goal-type.dto';

@ApiTags('SavingsGoal')
@ApiBearerAuth('JWT')
@Controller('users/saving-goals')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class SavingsGoalController {
  constructor(private service: SavingsGoalService) {}

  @RoleAuth(AuthUserRole.User)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: SavingsGoalDto,
  })
  async create(@Body() request: SavingsGoalInputDto): Promise<SavingsGoalDto> {
    return await this.service.create(request)
  }

  @RoleAuth(AuthUserRole.User)
  @Get(':id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({
    status: 201,
    type: SavingsGoalDto,
  })
  async get(@Param() params: any): Promise<SavingsGoalDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const savingsGoal = (await this.service.get(params.id)) as SavingsGoalDto;
    return plainToClass(SavingsGoalDto, savingsGoal);
  }

  @RoleAuth(AuthUserRole.User)
  @Patch(':id')
  @ApiResponse({ status: 200, type: SavingsGoalDto })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Body() dto: { name: string },
    @Param() params: any,
  ): Promise<SavingsGoalDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const savingsGoal = await this.service.update(params.id, dto);
    return plainToClass(SavingsGoalDto, savingsGoal);
  }
  @RoleAuth(AuthUserRole.User)
  @Patch('/favourite/:id')
  @ApiResponse({ status:200, type:SavingsGoalDto })
  @ApiParam({name:'id', required:true, type:  String })
  async updateFavourite(
    @Body() dto:{isFavorite: boolean},
    @Param()params:any
  ):Promise<SavingsGoalDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const savingsGoal = await this.service.updateFavourite(params.id, dto);
    return plainToClass(SavingsGoalDto, savingsGoal);
  }

  @RoleAuth(AuthUserRole.User)
  @Delete(':id')
  @ApiParam({ name:'id', required: true, type: String })
  @ApiResponse({
    status: 200,
  })
  async delete(@Param() params: any): Promise<void>{
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    this.service.delete(params.id);
}
  @RoleAuth(AuthUserRole.User)
  @Get()
  @ApiResponse({
    status:201,
    type: [SavingsGoalDto],
  })
  async getAll(): Promise<SavingsGoalDto[]>{
    return (await this.service.all()) as SavingsGoalDto[];
  }
}
