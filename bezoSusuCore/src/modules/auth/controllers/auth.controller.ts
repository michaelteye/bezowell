import {
  Controller,
  UsePipes,
  ValidationPipe,
  Post,
  Req,
  Body,
  UseGuards,
  Get,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { AdminIdentityService } from '../services/admin.service';
 import { LoginOutput } from '../types/login-output.type';
import { JwtManagerService } from '../services/jwt-manager.service';
import { MixedAuthGuard } from '../guards/mixed-auth.guard';
import {
  RegisterResponseDto,
  RegisterUserInputDto,
} from '../dto/register-user.dto';
import { AuthService } from '../services/auth.service';
import {
  ChangePasswordDto,
  PhoneEmailPasswordLoginInputDto,
  ResetPasswordDto,
} from '../dto/phone-email-login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RoleAuth, RoleAuthGuard } from '../guards/role-auth.guard';
import { AuthUserRole } from '../types/auth-user.roles';
import { ResponseDto } from '../dto/phone-email-login.dto';

@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('User Auth / User Onboarding')
export class AuthController {
  constructor(
    private readonly jwtManager: JwtManagerService,
    private service: AuthService,
  ) {}

  @Post('/users/signup')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: RegisterResponseDto,
  })
  async createUsers(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: RegisterUserInputDto,
  ): Promise<RegisterResponseDto> {
    if (file) {
      file = {
        ...file,
        originalname: file.originalname,
      };
      body.file = file;
    }
    return await this.service.registerUser(body);
  }

  @Post('/users/login')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: LoginOutput,
  })
  async login(
    @Req() req: any,
    @Body() dto: PhoneEmailPasswordLoginInputDto,
  ): Promise<LoginOutput> {
    return await this.service.authenticate(dto);
  }

  // reset password
  @Post('/users/reset-password')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: ResponseDto,
  })
  async resetPassword(
    @Req() req: any,
    @Body() dto: ResetPasswordDto,
  ): Promise<LoginOutput> {
    return await this.service.resetPassword(dto);
  }

  @Post('/users/change-password')
  @ApiResponse({
    status: 200,
    description: 'The record has been successfully created.',
    type: ResponseDto,
  })
  async changePassword(
    @Req() req: any,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return await this.service.changePassword(dto);
  }
}
