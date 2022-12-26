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
@Controller('user/wallets')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Wallet')
export class UserWalletController {
  constructor(private service: WalletService) {}

  @RoleAuth(AuthUserRole.User)
  @Get()
  @ApiResponse({
    status: 201,
    type: WalletDto,
  })
  async getAllWallets(): Promise<WalletDto[]> {
    return (await this.service.getWallets()) as WalletDto[];
  }

  
}
