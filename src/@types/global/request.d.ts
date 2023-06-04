import { AccountEntity } from '../../database/entities/account.entity';

declare module 'express' {
  interface Request {
    user: Partial<AccountEntity>;
  }
}
