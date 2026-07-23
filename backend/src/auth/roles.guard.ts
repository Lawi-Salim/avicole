import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ROLES_KEY } from './roles.decorator.js';
import 'reflect-metadata';

export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const clazz = context.getClass();

    const roles: string[] | undefined =
      Reflect.getMetadata(ROLES_KEY, handler) ??
      Reflect.getMetadata(ROLES_KEY, clazz);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('Accès interdit');
    }

    if (!roles.includes(user.role)) {
      throw new ForbiddenException(
        'Vous n\'avez pas les droits suffisants pour accéder à cette ressource',
      );
    }

    return true;
  }
}
