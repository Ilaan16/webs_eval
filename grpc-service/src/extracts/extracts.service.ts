import { Injectable } from '@nestjs/common';
import { join } from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { GrpcMethod } from '@nestjs/microservices';

@Injectable()
export class ExtractsService {
  private extracts = new Map();

  @GrpcMethod('ExtractService', 'GenerateExtract')
  generateExtract(data: { user_id: string; reservation_id: string; format: string }) {
    // Simuler la génération d'un extrait
    const extractId = crypto.randomUUID();
    const extract = {
      id: extractId,
      user_id: data.user_id,
      reservation_id: data.reservation_id,
      format: data.format,
      url: `https://example.com/extracts/${extractId}.${data.format}`,
      created_at: new Date().toISOString(),
    };

    this.extracts.set(extractId, extract);

    return {
      success: true,
      message: 'Extract generated successfully',
      extract_id: extractId,
    };
  }

  @GrpcMethod('ExtractService', 'GetExtract')
  getExtract(data: { extract_id: string }) {
    const extract = this.extracts.get(data.extract_id);
    if (!extract) {
      throw new Error('Extract not found');
    }
    return extract;
  }
} 