import { AuthUserEntity } from '../../../modules/auth/entities/auth-user.entity';
import { PasswordEncoderService } from '../../../modules/auth/services/password-encorder.service';
import { AuthUserRole } from '../../../modules/auth/types/auth-user.roles';
import { EntityManager } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { tabulateAuthUsers } from './utils';
import { Command, Console } from 'nestjs-console';

@Console()
export class CreateAdminCommand {
  constructor(
    private em: EntityManager,
    private passwordEncoder: PasswordEncoderService,
  ) {}

  @Command({
    command: 'create:admin',
    options: [
      {
        flags: '--email <email>',
        required: true,
      },
      {
        flags: '--password <password>',
        required: true,
      },
      {
        flags: '--displayName <displayName>',
        required: true,
      },
    ],
  })
  async execute(opts) {
    try {
      return await this._execute(opts);
    } catch (e) {
      console.error(e);
      return 1;
    }
  }

  async _execute(opts: {
    email: string;
    password: string;
    organizationSlug: string;
    displayName: string;
  }) {
    console.log(opts);
    // Create AuthUser
    const authUser = new AuthUserEntity();
    authUser.roles = [AuthUserRole.SuperAdmin];
    authUser.password = this.passwordEncoder.encodePassword(opts.password);

     authUser.email = opts.email;
    authUser.emailValidated = true;

    authUser.email =  opts.email;
    authUser.emailValidated = true;

    // create admin

    authUser.roles.push(AuthUserRole.Admin);

    // // Create user
    const user = new UserEntity();
    user.firstName = opts.displayName;
    authUser.user = user;

    await this.em.save([user, authUser]);

    tabulateAuthUsers([authUser]);

    // return 0;
  }
}
