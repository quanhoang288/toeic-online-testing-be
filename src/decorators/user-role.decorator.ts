import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from '../common/constants/role';

export const UserRole = (): CustomDecorator =>
  SetMetadata('roles', [Role.USER]);
