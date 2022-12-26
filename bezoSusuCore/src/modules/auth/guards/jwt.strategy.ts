import { UserAccountEntity } from './../../main/entities/useraccount.entity';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

import { GlobalConfig, globalConfig } from '../../../config';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { UserEntity } from '../../main/entities/user.entity';
import { filter } from 'rxjs';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(globalConfig.KEY) cfg: GlobalConfig,
    @InjectRepository(AuthUserEntity)
    private repository: Repository<AuthUserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.auth.jwt.secret,
    });
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const authUser: Partial<AuthUserEntity> = await this.repository.findOne({
      where: { id: userId },
      relations: [
        'user.userPaymentMethods',
        'user',
        'user.pin',
        'user.accounts',
        'user.files',
      ],
    });
    if (!authUser) {
      return false;
    }
    const user: AuthUserEntity | any = authUser;
    if (!authUser.roles.length && authUser.user.accounts.length) {
      user.account = authUser.user.accounts
        .filter((account) => account.name === 'Primary')
        .reduce((object, item) => Object.assign(object, item));
    }
    delete user.user.accounts;
    return user;
  }
}
