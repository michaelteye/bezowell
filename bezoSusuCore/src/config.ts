import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { config as loadDotenv } from 'dotenv';

const env = process.env;

//expiresIn: 3600 / 4, // 15 mins

export interface GlobalConfig {
  appEnv: 'dev' | 'stg' | 'prod' | 'test';
  sms: {
    url: string;
  };
  notification: {
    url: string;
  };
  mongo: {
    uri: string;
  };
  auth: {
    jwt: {
      secret: string;
    };
    refreshToken: {
      expiresIn: number;
    };
    accessToken: {
      expiresIn: number;
    };
  };
  azure: {
    container: string;
    connectionString: string;
  };
  payment: {
    url: string;
    callbackUrl: string;
    apiKey: string;
  };
}

const GlobalConfigSchema = Joi.object<GlobalConfig>({
  appEnv: Joi.string().valid('dev', 'stg', 'prod', 'test').required(),
  sms: Joi.object<GlobalConfig['sms']>({
    url: Joi.string().required(),
  }),
  
  
  mongo: Joi.object<GlobalConfig['mongo']>({
    uri: Joi.string().required(),
  }),
  auth: Joi.object<GlobalConfig['auth']>({
    jwt: Joi.object<GlobalConfig['auth']['jwt']>({
      secret: Joi.string().required(),
    }),
    refreshToken: Joi.object<GlobalConfig['auth']['refreshToken']>({
      expiresIn: Joi.number().required(),
    }),
    accessToken: Joi.object<GlobalConfig['auth']['accessToken']>({
      expiresIn: Joi.number().required(),
    }),
  }),

  azure: Joi.object<GlobalConfig['azure']>({
    container: Joi.string().required(),
    connectionString: Joi.string().required(),
  }),

  payment: Joi.object<GlobalConfig['payment']>({
    url: Joi.string().required(),
    callbackUrl: Joi.string().required(),
    apiKey: Joi.string().required(),
  }),
});

export const globalConfig = registerAs('global', () => {
  const appEnv = process.env.APP_ENV ?? 'dev';
  loadDotenv({ path: `.env.${appEnv}.local` });
  loadDotenv({ path: `.env.${appEnv}` });
  loadDotenv({ path: `.env.local` });
  loadDotenv({ path: `.env` });

  const cfg = {
    appEnv,
    sms: {
      url: process.env.NOTIFICATION_API,
    },
    notification:{
      url:process.env.NOTIFICATION_API
    },
    mongo: {
      uri: process.env.MONGODB_URI,
    },
    auth: {
      jwt: {
        secret: 'supersecret',
      },
      refreshToken: {
        expiresIn: 3600 * 24 * 30, // 1 month
      },
      accessToken: {
        expiresIn: 3600 * 24 * 30, // 1 month
      },
    },
    azure: {
      connectionString: env.AZURE_CONNECTION_STRING,
      container: env.AZURE_STORAGE_CONTAINER,
    },
    payment: {
      url: env.PAYMENT_URL,
      callbackUrl: env.PAYMENT_CALLBACK_URL,
      apiKey: env.PAYMENT_API_KEY,
    },

  } as GlobalConfig;

  if (!cfg.appEnv) {
    cfg.appEnv = 'dev';
  }

  // Validate
  const result = GlobalConfigSchema.validate(cfg, {
    allowUnknown: true,
    abortEarly: false,
  });
  if (result.error) {
    console.error('GlobalConfig Validation errors:');
    for (const v of result.error.details) {
      console.error(v.message);
    }
    throw new Error('Missing configuration options');
  }
  return cfg;
});
