import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { ExtractsService } from './extracts.service';

interface GenerateUserExtractRequest {
  user_id: number;
}

interface GenerateUserExtractResponse {
  url: string;
}

@Controller()
export class ExtractsController {
  constructor(private readonly extractsService: ExtractsService) {}

  @GrpcMethod('Extracts', 'GenerateUserExtract')
  async generateUserExtract(
    request: GenerateUserExtractRequest,
  ): Promise<GenerateUserExtractResponse> {
    const url = await this.extractsService.generateUserExtract(request.user_id);
    return { url };
  }
}
