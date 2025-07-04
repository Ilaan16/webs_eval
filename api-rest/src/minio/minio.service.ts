import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService {
  private client: Client;
  private readonly bucketName = 'reservations-csv';

  constructor(private configService: ConfigService) {
    this.client = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get('MINIO_PORT') || '9000', 10),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get('MINIO_SECRET_KEY') || 'minioadmin',
    });
  }

  async createBucket() {
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName);
    }
  }

  async uploadFile(fileName: string, content: string): Promise<string> {
    await this.createBucket();
    const buffer = Buffer.from(content, 'utf-8');
    const stream = Readable.from(buffer);
    await this.client.putObject(this.bucketName, fileName, stream);
    return this.getPresignedUrl(fileName);
  }

  async getPresignedUrl(fileName: string): Promise<string> {
    try {
      const externalClient = new Client({
        endPoint:
          this.configService.get('MINIO_EXTERNAL_ENDPOINT') ||
          this.configService.get('MINIO_ENDPOINT') ||
          'localhost',
        port: parseInt(this.configService.get('MINIO_PORT') || '9000', 10),
        useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
        accessKey: this.configService.get('MINIO_ACCESS_KEY') || 'minioadmin',
        secretKey: this.configService.get('MINIO_SECRET_KEY') || 'minioadmin',
      });

      const url = await externalClient.presignedGetObject(
        this.bucketName,
        fileName,
        24 * 60 * 60,
      );
      // Ensure we're returning a string
      return String(url);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to generate presigned URL: ${errorMessage}`);
    }
  }
}
