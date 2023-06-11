import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_ROUTE_KEY } from '../../../decorators/public-route.decorator';
import { ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const tokenProvided = !!ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    const isPublicRoute = this.reflector.get<boolean>(
      PUBLIC_ROUTE_KEY,
      context.getHandler(),
    );
    if (isPublicRoute && !tokenProvided) {
      return true;
    }

    return super.canActivate(context);
  }
}
