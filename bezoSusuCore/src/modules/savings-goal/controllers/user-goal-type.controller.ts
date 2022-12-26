import {
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Get,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiResponse } from '@nestjs/swagger';
import { MixedAuthGuard } from '../../../../src/modules/auth/guards/mixed-auth.guard';
import {
  RoleAuthGuard,
  RoleAuth,
} from '../../../../src/modules/auth/guards/role-auth.guard';
import { AuthUserRole } from '../../../../src/modules/auth/types/auth-user.roles';

import { GoalTypeService } from '../services/goal-type.service';
import { GoalTypeDto } from '../dtos/goal-type.dto';

@ApiTags('SavingsGoal')
@ApiBearerAuth('JWT')
@Controller('user/goal-types')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class UserGoalTypeController {
  constructor(private service: GoalTypeService) {}

  @RoleAuth(AuthUserRole.User)
  @Get()
  @ApiResponse({
    status: 201,
    type: [GoalTypeDto],
  })
  async getAll(): Promise<GoalTypeDto[]> {
    //return await this.service.all();
    return this.service.allSavingsGoalTypes();
  }
}
