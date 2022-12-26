import {
  Controller,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Param,
  Patch,
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
import { WalletDto } from '../dtos/wallet.dto';
import { WalletService } from '../services/wallet.service';

@ApiBearerAuth('JWT')
@Controller('admin/wallets')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Wallet')
export class WalletController {
  constructor(private service: WalletService) {}

  @RoleAuth(AuthUserRole.Admin)
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: WalletDto,
  })
  async create(@Body() wallet: WalletDto): Promise<WalletDto> {
    return this.service.createWallet(wallet);
  }

  @RoleAuth(AuthUserRole.Admin)
  @Patch(':id')
  @ApiResponse({ status: 200, type: WalletDto })
  @ApiParam({ name: 'id', required: true, type: String })
  async update(
    @Body() dto: WalletDto,
    @Param() params: any,
  ): Promise<WalletDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    const wallet = await this.service.updateWallet(params.id, dto);
    return plainToClass(WalletDto, wallet);
  }

  @RoleAuth(AuthUserRole.Admin)
  @Get(':id')
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiResponse({
    status: 201,
    type: WalletDto,
  })
  async getWallet(@Param() params: any): Promise<WalletDto> {
    if (params.id && !isUUID(params.id))
      throw new Error(
        `Invalid id, UUID format expected but received ${params.id}`,
      );
    return (await this.service.getWallet(params.id)) as WalletDto;
  }

  @RoleAuth(AuthUserRole.Admin)
  @Get()
  @ApiResponse({
    status: 201,
    type: WalletDto,
  })
  async getAllWallets(): Promise<WalletDto[]> {
    return (await this.service.getWallets()) as WalletDto[];
  }
}
