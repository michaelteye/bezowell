import { globalConfig } from './../../../config';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { addSeconds } from 'date-fns';
import { Repository } from 'typeorm';
import { AuthUserEntity } from '../entities/auth-user.entity';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import * as argon2 from 'argon2';
import { randomBytes, scrypt, createCipheriv, createDecipheriv } from 'crypto';
import { promisify } from 'util';

export interface RefreshTokenPayload {
  id: string;
}

@Injectable()
export class JwtManagerService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private refreshTokenRepository: Repository<RefreshTokenEntity>,
    @Inject(globalConfig.KEY) private config: ConfigType<typeof globalConfig>,
  ) {}

  async issueAccessToken(user: AuthUserEntity) {
    const payload = {
      sub: user.id,
      roles: user.roles,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.config.auth.accessToken.expiresIn,
    });
  }

  async issueRefreshToken(user: AuthUserEntity) {
    const payload: RefreshTokenPayload = {
      id: user.id,
    };
    return this.jwtService.sign(payload, {
      expiresIn: this.config.auth.refreshToken.expiresIn,
    });
  }

  async hashData(data: string, id?: string) {
    // const iv = randomBytes(16);
    // const password = id;
    // const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    // const cipher = createCipheriv('aes-256-ctr', key, iv);

    // const textToEncrypt = 'Nest';
    // const encryptedText = Buffer.concat([
    //   cipher.update(textToEncrypt),
    //   cipher.final(),
    // ]);
    // return encryptedText;
    return argon2.hash(data);
  }

  async verifyRefreshToken(encryptedText: any, token: any, id: string) {
    const iv = randomBytes(16);
    const decipher = createDecipheriv('aes-256-ctr', id, iv);
    const decryptedText = Buffer.concat([
      decipher.update(encryptedText),
      decipher.final(),
    ]);

    return decryptedText === token;
  }

  /**
   * Returns a base64-encoded refresh token
   * @param user
   */
  async generateRefreshToken(user: AuthUserEntity): Promise<string> {
    const token = new RefreshTokenEntity();
    token.userId = user.id;
    token.expiresAt = addSeconds(
      Date.now(),
      this.config.auth.refreshToken.expiresIn,
    );
    const refreshToken = await this.issueRefreshToken(user);
    token.token = await this.hashData(refreshToken);
    await this.refreshTokenRepository.insert(token);
    return refreshToken;
    // await this.refreshTokenRepository.insert(token);
    // const payload: RefreshTokenPayload = {
    //   id: token.id,
    // };
    // return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async getTokens(
    user: AuthUserEntity,
  ): Promise<{ token: string; refreshToken: string }> {
    const accessToken = await this.issueAccessToken(user);
    const refreshToken = await this.issueRefreshToken(user);
    return {
      token: accessToken,
      refreshToken,
    };
  }

  // async getTokens(userId: string, username: string) {
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.jwtService.signAsync(
  //       {
  //         sub: userId,
  //         username,
  //       },
  //       {
  //         secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
  //         expiresIn: this.config.auth.accessToken.expiresIn,
  //       },
  //     ),
  //     this.jwtService.signAsync(
  //       {
  //         sub: userId,
  //         username,
  //       },
  //       {
  //         secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
  //         expiresIn: this.config.auth.refreshToken.expiresIn,
  //       },
  //     ),
  //   ]);

  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }
}
