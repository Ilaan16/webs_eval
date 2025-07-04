import { Injectable, Logger } from "@nestjs/common";
import { Client } from "minio";
import { Readable } from "stream";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MinioService {
  private client: Client;
  private readonly bucketName = "reservations-csv";
  private readonly logger = new Logger(MinioService.name);
  private readonly useMockMode: boolean;

  constructor(private configService: ConfigService) {
    // Use mock mode if MinIO is not properly configured
    this.useMockMode = !this.configService.get("MINIO_ENDPOINT") || 
                      this.configService.get("MINIO_MOCK_MODE") === "true";

    if (!this.useMockMode) {
      this.client = new Client({
        endPoint: this.configService.get("MINIO_ENDPOINT") || "localhost",
        port: parseInt(this.configService.get("MINIO_PORT") || "9000", 10),
        useSSL: this.configService.get("MINIO_USE_SSL") === "true",
        accessKey: this.configService.get("MINIO_ACCESS_KEY") || "minioadmin",
        secretKey: this.configService.get("MINIO_SECRET_KEY") || "minioadmin",
      });
    }

    this.logger.log(`MinIO service initialized in ${this.useMockMode ? 'mock' : 'real'} mode`);
  }

  async createBucket() {
    if (this.useMockMode) return;
    
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName);
      }
    } catch (error) {
      this.logger.error(`Failed to create bucket: ${error.message}`);
      throw error;
    }
  }

  async uploadFile(fileName: string, content: string): Promise<string> {
    if (this.useMockMode) {
      this.logger.log(`Mock upload: ${fileName}`);
      return this.generateMockUrl(fileName, content);
    }

    try {
      await this.createBucket();
      const buffer = Buffer.from(content, "utf-8");
      const stream = Readable.from(buffer);
      await this.client.putObject(this.bucketName, fileName, stream);
      return this.getPresignedUrl(fileName);
    } catch (error) {
      this.logger.error(`Upload failed, falling back to mock: ${error.message}`);
      return this.generateMockUrl(fileName, content);
    }
  }

  private generateMockUrl(fileName: string, content: string): string {
    // Pour les tests, on crée une URL simple vers un endpoint mock du service gRPC
    const port = 50052; // Port du serveur HTTP mock
    // Encoder le contenu en base64 pour le passer dans l'URL
    const encodedContent = Buffer.from(content).toString('base64');
    return `http://localhost:${port}/mock-csv?file=${fileName}&content=${encodeURIComponent(encodedContent)}`;
  }

  async getPresignedUrl(fileName: string): Promise<string> {
    if (this.useMockMode) {
      return this.generateMockUrl(fileName, "");
    }

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
      return String(url);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error(`Failed to generate presigned URL: ${errorMessage}`);
      // Fallback to mock mode
      return this.generateMockUrl(fileName, "");
    }
  }
}
