import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { HumanBeing } from "./entities/humanbeing";
import { LabController } from "./lab.controller";
import { LabService } from "./lab.service";

@Module({
  imports: [MikroOrmModule.forFeature([HumanBeing])],
  controllers: [LabController],
  providers: [LabService],
})
export class LabModule {}
