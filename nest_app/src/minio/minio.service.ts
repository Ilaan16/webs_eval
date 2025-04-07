import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private client: Client;
  private readonly bucketName = 'reservations-csv';

  constructor() {
    this.client = new Client({
      endPoint: 'localhost',
      port: 9000,
      useSSL: false,
      accessKey: 'minioadmin',
      secretKey: 'minioadmin',
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
    return this.client.presignedGetObject(
      this.bucketName,
      fileName,
      24 * 60 * 60,
    );
  }
}
