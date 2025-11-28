import { DataSource } from 'typeorm';

import type { DataSourceOptions } from 'typeorm';

export const getDataSourceOptions = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5436'),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'test',
    database: process.env.DATABASE_NAME || 'myapp',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.DATABASE_SSL === 'true' || false,
    extra: {
      max: 10,
      min: 2,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
    },
  };
};

export const AppDataSource = new DataSource(getDataSourceOptions());
