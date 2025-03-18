import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { KeycloakAuthGuard } from '../../auth/keycloak-auth.guard';

@Injectable()
export class GqlAuthGuard extends KeycloakAuthGuard {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
} 