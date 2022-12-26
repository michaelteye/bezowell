import { ExecutionContext, Injectable, CanActivate, NotFoundException } from '@nestjs/common';
import { getAppContextALS } from '../../../utils/context';
import { AppRequestContext } from '../../../utils/app-request.context';
import { UserService } from 'src/modules/auth/services/user.service';

@Injectable()
export class InjectUssdUserAuthGuard implements CanActivate {
    constructor(private readonly userService: UserService) { }

    getRequest(context: ExecutionContext) {
        const type = context.getType();
        if (type === 'http') {
            const ctx = context.switchToHttp();
            return ctx.getRequest();
        } else {
            throw new Error('Unsupported execution type');
        }
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = this.getRequest(context);
        const ctx = getAppContextALS<AppRequestContext>();
        const mobileNumber = req.body.mobileNumber;
        const user = await this.userService.getUserByPhone(mobileNumber);
        if (user) {
            console.log('The user was found by mobile');
            console.log('The user id is found by mobile', user.id);
            req.user = user;
            ctx.authUser = req.user;
            return true;
        } else {
            throw new NotFoundException('User not found');
        }
    }
}
