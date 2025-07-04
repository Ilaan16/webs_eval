import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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
        return { userId: payload.sub, username: payload.preferred_username };
    }
}
