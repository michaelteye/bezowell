import {
  Controller,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { CreateOtpDto, OtpDto } from '../dto/otp.dto';
import { AuthService } from '../services/auth.service';

//@UseGuards(MixedAuthGuard)
@Controller()
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Otp')
export class OtpController {
  constructor(private service: AuthService) {}

  @Post('/otps')
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async createOtp(
    @Body() payload: CreateOtpDto,
  ): Promise<{ message: string; otp?: string }> {
    return await this.service.createOtp(payload);
  }

  @Post('/otps/verify')
  @ApiResponse({
    status: 200,
    description: 'Otp has been verified',
  })
  async verifyOtp(
    @Req() req: any,
    @Body() dto: OtpDto,
  ): Promise<{ message: string }> {
    return await this.service.verifyOtp(dto);
  }
}
