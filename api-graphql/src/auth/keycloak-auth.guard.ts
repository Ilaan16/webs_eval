import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {GqlExecutionContext} from '@nestjs/graphql';

@Injectable()
export class KeycloakAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err, user, info) {
        if (err || !user) {
            throw new UnauthorizedException();
        }
        return user;
    }

    getRequest(context: ExecutionContext) {
        // Try HTTP first
        const req = context.switchToHttp().getRequest();
        if (req) return req;
        // GraphQL context fallback
        const gqlCtx = GqlExecutionContext.create(context).getContext();
        return gqlCtx.req;
    }
}
