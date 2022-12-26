import {
  Body,
  Controller,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  RoleAuth,
  RoleAuthGuard,
} from 'src/modules/auth/guards/role-auth.guard';
import { AuthUserRole } from 'src/modules/auth/types/auth-user.roles';

import { AccountService } from '../services/account.service';
import { TransferToAccountDto } from '../dtos/transfer-account.dto';
import { MixedAuthGuard } from 'src/modules/auth/guards/mixed-auth.guard';

@ApiTags('Account')
@ApiBearerAuth('JWT')
@Controller('accounts')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class AccountController {
  constructor(private service: AccountService) {}

  // @RoleAuth(AuthUserRole.User)
  // @Post('user/transfer')
  // @ApiResponse({
  //   status: 201,
  //   description: 'Transfer to user account was successful.',
  // })
  // async transferToUserAccount(
  //   @Body() input: TransferToAccountDto,
  // ): Promise<void> {
  //   await this.service.transferToUserAccount(input);
  // }
}
