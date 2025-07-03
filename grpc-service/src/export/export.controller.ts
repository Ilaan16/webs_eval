import { Controller, UseGuards } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import { Metadata } from "@grpc/grpc-js";
import { ExportService } from "./export.service";
import { KeycloakAuthGuard } from "../auth/keycloak-auth.guard";

@Controller()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @GrpcMethod("ExportService", "ExportReservations")
  @UseGuards(KeycloakAuthGuard)
  async exportReservations(
    data: { userId: number },
    metadata: Metadata,
  ): Promise<{ url: string }> {
    const url = await this.exportService.exportReservations(data.userId);
    return { url };
  }
}
