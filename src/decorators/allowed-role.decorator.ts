import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const AllowedRoles = (roles: string[]): CustomDecorator =>
  SetMetadata('roles', roles);
