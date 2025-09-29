import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiProperty } from "@nestjs/swagger";

export class HealthResponse {
  @ApiProperty({ example: "1.0.0" })
  version: string;

  @ApiProperty({ example: "2025-05-27T14:20:12+03:00" })
  lastCommitDate: string;
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHealth(): HealthResponse {
    return {
      version: this.configService.get("VERSION") as string,
      lastCommitDate: this.configService.get("LAST_COMMIT_DATE") as string,
    };
  }
}
