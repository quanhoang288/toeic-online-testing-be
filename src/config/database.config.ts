import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, DataSourceOptions } from 'typeorm';

import { SnakeNamingStrategy } from '../database/snake-naming.strategy';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env['DB_HOST'] || 'localhost',
  port: process.env['DB_PORT'] ? Number(process.env['DB_PORT']) : 3307,
  username: process.env['DB_USERNAME'] || 'dev',
  password: process.env['DB_PASSWORD'] || 'test',
  database: process.env['DB_DATABASE'] || 'toeic-db',
  logging: true,
  entities: [__dirname + '../**/entities/*.entity.{js,ts}'],
  subscribers: [],
  migrations: [__dirname + '../**/migrations/*.{js,ts}'],
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
