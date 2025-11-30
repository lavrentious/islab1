import { S3Client } from "@aws-sdk/client-s3";
import { Module } from "@nestjs/common";

import { ConfigService } from "@nestjs/config";
import { EnvironmentVariables } from "src/env.validation";
import { ImportFileStorageService } from "./import-file-storage.service";

@Module({
  providers: [
    {
      provide: S3Client,
      useFactory: (configService: ConfigService<EnvironmentVariables>) => {
        return new S3Client({
          endpoint: configService.get("S3_ENDPOINT"),
          region: configService.get("S3_REGION"),
          credentials: {
            accessKeyId: configService.get("S3_ACCESS_KEY")!,
            secretAccessKey: configService.get("S3_SECRET_ACCESS_KEY")!,
          },
          forcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },

    ImportFileStorageService,
  ],
  exports: [ImportFileStorageService],
})
export class ImportFileStorageModule {}
