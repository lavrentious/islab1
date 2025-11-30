import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ImportOperation } from "./entities/importoperation.entity";
import { ImporterController } from "./importer.controller";
import { ImporterGateway } from "./importer.gateway";
import { ImporterProcessor } from "./importer.processor";
import { ImporterService } from "./importer.service";
import { ImportFileStorageModule } from "./storage/import-file-storage.module";

@Module({
  imports: [
    MikroOrmModule.forFeature([ImportOperation]),
    BullModule.registerQueue({
      name: "import-queue",
    }),
    ImportFileStorageModule,
  ],
  controllers: [ImporterController],
  providers: [ImporterService, ImporterProcessor, ImporterGateway],
})
export class ImporterModule {}
