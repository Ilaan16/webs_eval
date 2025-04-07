import { Controller, Get, Param } from '@nestjs/common';
import { ExtractsService } from './extracts.service';

@Controller('api/users')
export class ExtractsController {
  constructor(private readonly extractsService: ExtractsService) {}

  @Get(':id/extract')
  async generateUserExtract(@Param('id') id: string) {
    const url = await this.extractsService.generateUserExtract(parseInt(id));
    return { url };
  }
}
