import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  AdminTransferToAccountDto,
  AdminTransferResponseDto,
  TransferToAccountDto,
} from 'src/modules/account/dtos/transfer-account.dto';

import { UserDto } from 'src/modules/auth/dto/user.dto';
import { MixedAuthGuard } from 'src/modules/auth/guards/mixed-auth.guard';
import {
  RoleAuthGuard,
  RoleAuth,
} from 'src/modules/auth/guards/role-auth.guard';
import { AuthUserRole } from 'src/modules/auth/types/auth-user.roles';
import { TransferService } from '../services/transfer.service';


@ApiTags('Transfer')
@ApiBearerAuth('JWT')
@Controller()
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class TransferController {
  constructor(private service: TransferService) { }

  @RoleAuth(AuthUserRole.User)
  @Post('user/transfer')
  @ApiResponse({
    status: 201,
    description: 'Transfer to user account was successful.',
  })
  async transferToUserAccount(
    @Body() input: TransferToAccountDto,
  ): Promise<void> {
    await this.service.transferToUserAccount(input);
  }
}
