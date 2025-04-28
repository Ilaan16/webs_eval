import { Controller, Get, UseGuards } from '@nestjs/common';
import { KeycloakAuthGuard } from './auth/keycloak-auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(KeycloakAuthGuard)
  getProtectedData() {
    return { message: 'Vous avez accédé à une route protégée avec Keycloak' };
  }
}
