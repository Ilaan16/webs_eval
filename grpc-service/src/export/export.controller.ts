import { Controller, Logger } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { Metadata } from "@grpc/grpc-js";
import { ExportService } from "./export.service";
import { status } from "@grpc/grpc-js";

@Controller()
export class ExportController {
  private readonly logger = new Logger(ExportController.name);

  constructor(private readonly exportService: ExportService) {}

  @GrpcMethod("ExportService", "ExportReservations")
  async exportReservations(
    data: { userId: number },
    metadata: Metadata,
  ): Promise<{ url: string }> {
    try {
      this.logger.log(`Exporting reservations for user ${data.userId}`);
      const url = await this.exportService.exportReservations(data.userId);
      this.logger.log(`Export successful, URL: ${url}`);
      return { url };
    } catch (error) {
      this.logger.error(`Export failed for user ${data.userId}:`, error);
      throw new RpcException({
        code: status.INTERNAL,
        message: `Failed to export reservations: ${error.message}`,
      });
    }
  }
}
