import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class KeycloakAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(KeycloakAuthGuard.name);

    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (isPublic) {
            return true;
        }
        
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (info) {
            this.logger.error(`Authentication Error: ${info.message}`);
        }
        if (err || !user) {
            this.logger.error('User not found or error during authentication.', err);
            throw err || new UnauthorizedException();
        }
        return user;
    }
}
