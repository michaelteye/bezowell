import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class HashService {
  createHash(data: string) {
    return createHash('sha1').update(data).digest('hex');
  }
}
