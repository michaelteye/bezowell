import { DataSource, DataSourceOptions } from 'typeorm';

import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

dotenv.config();

const env = process.env;

const entities = [path.join(__dirname, 'src/**/*.entity.{js,ts}')];
const migrations = [path.join(__dirname, 'build/src/migrations/*.{js,ts}')];

const url = new URL(env.DATABASE_URL);
const sslmode = url.searchParams.get('sslmode');
const db = url.pathname.replace('/', '');

const connection = {
  type: 'postgres',
  host: url.hostname,
  port: Number(url.port),
  username: url.username,
  password: decodeURIComponent(url.password),
  database: env.NODE_ENV === 'test' ? db.replace('bezov2', 'bezov2-test') : db,
  synchronize: true,
  migrationsRun: false,
  dropSchema: false,
  logging: env.TYPEORM_LOGGING === 'true',
  entities,
  migrations,
  ...(sslmode === 'require' && {
    ssl: {
      rejectUnauthorized: false,
    },
  }),
} as DataSourceOptions;

export const connectionSource = connection;
export const dataSource = new DataSource(connection);
