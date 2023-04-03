import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env['DB_HOST'] || 'localhost',
  port: process.env['DB_PORT'] ? Number(process.env['DB_PORT']) : 3307,
  username: process.env['DB_USERNAME'] || 'dev',
  password: process.env['DB_PASSWORD'] || 'test',
  database: process.env['DB_DATABASE'] || 'blog_dev',
  logging: true,
  entities: [path.join(__dirname, '../../**/entities/**/*.entity.{js,ts}')],
  subscribers: [],
  migrations: [path.join(__dirname, '../../**/migrations/*.{js,ts}')],
  namingStrategy: new SnakeNamingStrategy(),
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
