import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: "notification",
        protoPath: join(__dirname, "../proto/service.proto"),
        url: "0.0.0.0:50051",
      },
    }
  );

  await app.listen();
  console.log("gRPC Microservice running on port 50051");
}

bootstrap();
