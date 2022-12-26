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
import { MixedAuthGuard } from '../../auth/guards/mixed-auth.guard';
import {
  RoleAuthGuard,
  RoleAuth,
} from '../../auth/guards/role-auth.guard';
import { AuthUserRole } from '../../auth/types/auth-user.roles';
import { AccountTypeService } from '../services/account-type.service';
import { AccountTypeDto } from '../dtos/account-type.dto';
import { AccountDto } from '../dtos/account.dto';

@ApiTags('AccountType')
@ApiBearerAuth('JWT')
@Controller()
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class UserAccountTypeController {
  constructor(private service: AccountTypeService) {}

  @RoleAuth(AuthUserRole.User)
  @Get('user/account-types')
  @ApiResponse({
    status: 201,
    type: AccountTypeDto,
  })
  async getAll(): Promise<AccountTypeDto[]> {
    return (await this.service.all()) as AccountTypeDto[];
  }
}
