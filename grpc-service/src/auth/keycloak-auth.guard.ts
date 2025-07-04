import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class KeycloakAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(KeycloakAuthGuard.name);

    getRequest(context: ExecutionContext) {
        const rpcContext = context.switchToRpc();
        const metadata = rpcContext.getContext();
        this.logger.debug(`gRPC Metadata: ${JSON.stringify(metadata.getMap())}`);
        return metadata;
    }

    handleRequest(err, user, info) {
        if (info) {
            this.logger.error(`Authentication Error: ${info.message}`, info.stack);
        }
        if (err || !user) {
            this.logger.error('User not found or error during authentication.', err);
            throw err || new RpcException(info?.message || 'Unauthorized');
        }
        this.logger.log('Authentication successful, user found.');
        return user;
    }
} 