import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { ExportService } from "./export.service";

@Controller()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @GrpcMethod("ExportService", "ExportReservations")
  async exportReservations(data: { userId: number }): Promise<{ url: string }> {
    const url = await this.exportService.exportReservations(data.userId);
    return { url };
  }
}
