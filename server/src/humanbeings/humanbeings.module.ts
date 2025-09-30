import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { HumanBeing } from "./entities/humanbeing";
import { HumanBeingsController } from "./humanbeings.controller";
import { HumanBeingsService } from "./humanbeings.service";

@Module({
  imports: [MikroOrmModule.forFeature([HumanBeing])],
  controllers: [HumanBeingsController],
  providers: [HumanBeingsService],
})
export class HumanBeingsModule {}
