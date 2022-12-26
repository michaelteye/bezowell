import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET_KEY,
  },
  refreshToken: {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  },
  accessToken: {
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
}));
