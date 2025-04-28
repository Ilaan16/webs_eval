import { Resolver, Args, Mutation } from '@nestjs/graphql';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as request from 'request-promise-native';

@Resolver('Auth')
export class AuthResolver {
  @Mutation('login')
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    try {
      // Utilisation de l'API de Keycloak pour obtenir un token
      const response = await request({
        method: 'POST',
        uri: 'http://localhost:8080/realms/myrealm/protocol/openid-connect/token',
        form: {
          grant_type: 'password',
          client_id: 'myclient',
          client_secret: 'mysecret',
          username: email,
          password: password,
          scope: 'openid',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        json: true,
      });

      return {
        accessToken: response.access_token,
      };
    } catch (error) {
      throw new HttpException(
        'Invalid credentials',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
} 