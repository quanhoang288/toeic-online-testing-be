import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from '../common/constants/role';

export const AdminRole = (): CustomDecorator =>
  SetMetadata('roles', [Role.ADMIN, Role.SUPER_ADMIN]);
