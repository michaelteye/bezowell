import {
  Controller,
  UsePipes,
  ValidationPipe,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EmailPasswordLoginInput } from '../dto/email-login.dto';
import { AdminIdentityService } from '../services/admin.service';
import { LoginOutput } from '../types/login-output.type';
import { JwtManagerService } from '../services/jwt-manager.service';
import { MixedAuthGuard } from '../guards/mixed-auth.guard';
import { isUUID } from 'class-validator';

@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
@ApiBearerAuth('JWT')
@ApiTags('Admin Auth')
export class AdminAuthController {
  constructor(
    private readonly adminService: AdminIdentityService,
    private readonly jwtManager: JwtManagerService,
  ) { }

  @Post('/admin/login')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: LoginOutput,
  })

  async login(
    @Req() req: any,
    @Body() dto: EmailPasswordLoginInput,
  ): Promise<LoginOutput> {
    const res = await this.adminService.authenticate(dto);
    const result = new LoginOutput();
    result.token = await this.jwtManager.issueAccessToken(res);
    result.refreshToken = await this.jwtManager.generateRefreshToken(res);
    return result;
  }

  @UseGuards(MixedAuthGuard)
  @Get('/admin/me')
  @ApiResponse({
    status: 200,
  })
  async me(): Promise<any> {
    return this.adminService.me();
  }

  // @UseGuards(MixedAuthGuard)
  // @Get('/admin/reverse-transaction')
  // @ApiResponse({
  //   status: 200,
  // })
  // async revereTransaction(): Promise<any> {
  //   return this.adminService.revereTransaction();
  // }



  // @UseGuards(MixedAuthGuard)
  // @Get('/admin/reverse')
  // @ApiResponse({
  //   status: 200,
  // })
  // async reverseTransaction(): Promise<any> {
  //   return this.adminService.me();
  // }


  // @UseGuards(MixedAuthGuard)
  @Get('/admin/reverse-transaction/:id')
  @ApiParam({ name: 'id', required: true, type: String })
  async reverseTransaction(@Param() params: any): Promise<any> {
    return (await this.adminService.reverseTransaction(params.id))
  }
}
