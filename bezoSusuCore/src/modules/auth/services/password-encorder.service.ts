import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const crypto = require('crypto');
@Injectable()
export class PasswordEncoderService {
  encodePassword(password: string) {
    const rounds = process.env.NODE_ENV === 'test' ? 1 : 10;
    return bcrypt.hashSync(password, rounds);
  }

  verifyPassword(
    plain: string,
    encoded: string,
    migrated?: { phone: string; user_id: string },
  ) {
    if (migrated) {
      const senderId = this.encryptKey(migrated.phone);
      const user = senderId === migrated.user_id;
      const encrypt = this.encryptKey(plain);
      const password = encrypt === encoded;
      if (user && password) {
        return true;
      }
    }
    return bcrypt.compareSync(plain, encoded);
  }

  // for migrated users
  encryptKey(text: string) {
    try {
      const senderId = crypto.createHash('sha1').update(text).digest('hex');
      return senderId;
    } catch (error) {
      console.log('get sender id', error);
    }
  }
}
