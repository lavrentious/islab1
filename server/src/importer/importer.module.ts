import { MikroOrmModule } from "@mikro-orm/nestjs";
import { BullModule } from "@nestjs/bull";
import { Module } from "@nestjs/common";
import { ImportOperation } from "./entities/importoperation.entity";
import { ImporterController } from "./importer.controller";
import { ImporterProcessor } from "./importer.processor";
import { ImporterService } from "./importer.service";

@Module({
  imports: [
    MikroOrmModule.forFeature([ImportOperation]),
    BullModule.registerQueue({
      name: "import-queue",
    }),
  ],
  controllers: [ImporterController],
  providers: [ImporterService, ImporterProcessor],
})
export class ImporterModule {}
