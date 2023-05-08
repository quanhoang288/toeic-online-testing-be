import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export const appConfig = registerAs('app', () => ({
  environment: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  enableDocumentation: process.env.ENABLE_DOCUMENTATION,
  tmpUploadDir: path.join(__dirname, '../../tmp-upload'),
}));
