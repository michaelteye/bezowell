import {
  Body,
  Controller,
  Get,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { isUUID } from 'class-validator';
import { MixedAuthGuard } from '../../../../src/modules/auth/guards/mixed-auth.guard';
import { NotificationDto } from '../dtos/notification.dto';
import { RoleAuth, RoleAuthGuard } from '../../auth/guards/role-auth.guard';
import { AuthUserRole } from '../../../../src/modules/auth/types/auth-user.roles';
import { NotificationService } from '../services/notification.service';

@ApiBearerAuth('JWT')
@Controller('')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
@ApiTags('Notifications')
export class NotificationController {
  constructor(private service: NotificationService) {}

  @RoleAuth(AuthUserRole.Admin)
  @Get('admin/notifications')
  @ApiResponse({
    status: 201,
    description: 'Notification Sent',
  })
  async sendNotifications(@Body() body: NotificationDto): Promise<void> {
    return Promise.resolve();
  }

  @Get('users/send/notification')
  @ApiResponse({
    status: 201,
    description: 'Notification Sent',
  })
  async userNotification(@Body() body: NotificationDto): Promise<void> {
    await this.service.sendUsersNotifications(body);
  }
}
