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
import { MixedAuthGuard } from '../../auth/guards/mixed-auth.guard';
import { RoleAuthGuard, RoleAuth } from '../../auth/guards/role-auth.guard';
import { AuthUserRole } from '../../auth/types/auth-user.roles';
import { WalletDto } from '../../wallet/dtos/wallet.dto';
import { AccountTypeService } from '../services/account-type.service';
import { AccountTypeDto, AccountTypeInputDto } from '../dtos/account-type.dto';

@ApiTags('AccountType')
@ApiBearerAuth('JWT')
@Controller('admin/account-types')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class AdminAccountTypeController {
  constructor(private service: AccountTypeService) {}

  @RoleAuth(AuthUserRole.Admin)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: AccountTypeDto,
  })
  async create(
    @Body() accountType: AccountTypeInputDto,
  ): Promise<AccountTypeDto> {
    return await this.service.create(accountType);
  }

  @RoleAuth(AuthUserRole.Admin)
  @Patch(':id')
  @ApiResponse({ status: 200, type: WalletDto })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Body() dto: AccountTypeInputDto,
    @Param() params: any,
  ): Promise<AccountTypeDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const accountType = await this.service.update(params.id, dto);
    return plainToClass(AccountTypeDto, accountType);
  }

  @RoleAuth(AuthUserRole.Admin)
  @Get(':id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({
    status: 201,
    type: AccountTypeDto,
  })
  async get(@Param() params: any): Promise<AccountTypeDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    return (await this.service.get(params.id)) as AccountTypeDto;
  }

  @RoleAuth(AuthUserRole.Admin)
  @Get()
  @ApiResponse({
    status: 201,
    type: WalletDto,
  })
  async getAll(): Promise<AccountTypeDto[]> {
    return (await this.service.all()) as AccountTypeDto[];
  }
}
