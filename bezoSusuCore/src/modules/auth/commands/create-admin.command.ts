import { AuthUserEntity } from '../../../modules/auth/entities/auth-user.entity';
import { PasswordEncoderService } from '../../../modules/auth/services/password-encorder.service';
import { AuthUserRole } from '../../../modules/auth/types/auth-user.roles';
import { Command, Console } from 'nestjs-console';
import { EntityManager } from 'typeorm';

import { UserEntity } from 'src/modules/main/entities/user.entity';
import { STATUS } from '../entities/enums/status.enum';
import { tabulateAuthUsers } from './util';

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
    // const password = new PasswordEntity();
    authUser.password = this.passwordEncoder.encodePassword(opts.password);
    authUser.accountStatus = STATUS.active;
    authUser.email = opts.email;
    authUser.emailValidated = true;
    // const emailIdentity = new EmailIdentityEntity();
    // emailIdentity.email = opts.email;
    // emailIdentity.emailValidated = true;
    // authUser.emailIdentity = emailIdentity;

    // // Create user
    const user = new UserEntity();
    user.firstName = opts.displayName;
    user.lastName = 'Main';
    user.userName = 'Admin10';
    authUser.user = user;

    // create admin

    // const admin = new AdminEntity();

    // authUser.user = admin;

    // console.log(authUser);

    const res = await this.em.save(authUser);
    console.log('response', res);

    // tabulateAuthUsers([authUser]);

    // return 0;
  }

  generateUsername = (word1, word2) => {
    const suffix = ['2022', '22', 'theGreat', '10'];
    const prefix = ['great', 'good', 'the', 'brilliant'];

    const suggestions = [];
    suggestions.push(`${word1}${word2}`);
    suffix.forEach((word) => {
      suggestions.push(`${word1}${word}${word2}`);
      suggestions.push(`${word1}${word}`);
      suggestions.push(`${word2}${word}`);
      suggestions.push(`${word1}${word2}${word}`);
    });
    prefix.forEach((word) => {
      suggestions.push(`${word1}${word}${word2}`);
      suggestions.push(`${word}${word1}`);
      suggestions.push(`${word}${word2}`);
      suggestions.push(`${word1}${word}${word2}`);
    });

    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };
}
