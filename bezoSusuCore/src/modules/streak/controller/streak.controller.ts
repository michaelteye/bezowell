import { TransactionEntity } from 'src/modules/transactions/entities/transaction.entity';
import { StreakService } from './../service/streak.service';
import { RoleAuth, RoleAuthGuard } from './../../auth/guards/role-auth.guard';
import { MixedAuthGuard } from './../../auth/guards/mixed-auth.guard';
import { Controller, Get, Param, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiParam, ApiResponse } from "@nestjs/swagger";
import { AuthUserRole } from 'src/modules/auth/types/auth-user.roles';

@ApiBearerAuth('JWT')
@Controller('user/streak')
@UseGuards(MixedAuthGuard, RoleAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class StreakController{
    constructor(private service: StreakService){}

    @RoleAuth(AuthUserRole.User)
    @Get('/:user_id')
    @ApiResponse({
        status:200,
        description: 'Get streak of user'
    })
    async UserStreak(
        @Param('user_id') user_id: string,
        ): Promise<TransactionEntity>{
             return await this.service.getUsersStreak(user_id);
    }
}
