import { Controller, Get } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";
import { AppService, HealthResponse } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiResponse({ status: 200, type: HealthResponse })
  @Get()
  getHealth(): HealthResponse {
    return this.appService.getHealth();
  }
}
