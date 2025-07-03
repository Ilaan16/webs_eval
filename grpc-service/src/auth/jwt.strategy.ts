import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';
import { Metadata } from '@grpc/grpc-js';

const extractJwtFromGrpcMetadata = (metadata: Metadata): string | null => {
    if (!metadata) {
        return null;
    }
    const authHeader = metadata.get('authorization');
    if (!authHeader || authHeader.length === 0) {
        return null;
    }

    const token = authHeader[0].toString();
    const parts = token.split(' ');

    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }

    return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: any) => {
                    if (request instanceof Metadata) {
                        return extractJwtFromGrpcMetadata(request);
                    }
                    return ExtractJwt.fromAuthHeaderAsBearerToken()(request);
                }
            ]),
            ignoreExpiration: false,
            secretOrKeyProvider: jwksRsa.passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}/protocol/openid-connect/certs`,
            }),
            audience: [
                configService.get('KEYCLOAK_CLIENT_ID'),
                'account',
            ],
            issuer: `${configService.get('KEYCLOAK_ISSUER_URL')}/realms/${configService.get('KEYCLOAK_REALM')}`,
        });
    }

    async validate(payload: any) {
        return { userId: payload.sub, username: payload.preferred_username, roles: payload.realm_access.roles };
    }
} 