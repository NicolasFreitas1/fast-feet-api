import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserPayload } from './jwt.strategy'
import { IS_ADMIN_KEY } from './is-admin.decorator'

@Injectable()
export class IsAdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isAdminRoute = this.reflector.getAllAndOverride<boolean>(
      IS_ADMIN_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!isAdminRoute) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user as UserPayload | undefined

    if (!user || user.userRole !== 'ADMIN') {
      throw new ForbiddenException('Admin access required')
    }

    return true
  }
}
