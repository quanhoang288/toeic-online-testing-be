import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();

export const authConfig = registerAs('auth', () => ({
  jwt: {
    accessTokenExpiresInSec: 3 * 60 * 60,
    secret: process.env.JWT_SECRET || 'secret',
  },
}));
