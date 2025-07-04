import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import * as http from 'http';
import { URL } from 'url';

async function bootstrap() {
  const logger = new Logger('GrpcService');

  // Create the main gRPC microservice
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'notification',
        protoPath: join(__dirname, '../proto/service.proto'),
        url: 'localhost:50051',
      },
    },
  );

  // Create a simple HTTP server for mock CSV endpoints
  const httpServer = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    
    if (req.method === 'GET' && req.url?.startsWith('/mock-csv')) {
      try {
        const url = new URL(req.url, `http://localhost:50052`);
        const file = url.searchParams.get('file');
        const content = url.searchParams.get('content');
        
        if (!content) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Missing content parameter');
          return;
        }

        // Decode the base64 content
        const csvContent = Buffer.from(decodeURIComponent(content), 'base64').toString('utf-8');
        
        res.writeHead(200, {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${file || 'export.csv'}"`
        });
        res.end(csvContent);
      } catch (error) {
        logger.error('Error serving mock CSV:', error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error serving CSV');
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  });

  // Start HTTP server on port 50052
  const httpPort = process.env.HTTP_PORT || 50052;
  httpServer.listen(httpPort, () => {
    logger.log(`HTTP mock server running on port ${httpPort}`);
  });

  // Start gRPC microservice
  await app.listen();
  logger.log('gRPC microservice is listening on port 50051');
}

bootstrap();
