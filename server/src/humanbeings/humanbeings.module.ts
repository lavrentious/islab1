import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CarsModule } from "src/cars/cars.module";
import { HumanBeing } from "./entities/humanbeing.entity";
import { HumanBeingsController } from "./humanbeings.controller";
import { HumanBeingsService } from "./humanbeings.service";

@Module({
  imports: [MikroOrmModule.forFeature([HumanBeing]), CarsModule],
  controllers: [HumanBeingsController],
  providers: [HumanBeingsService],
})
export class HumanBeingsModule {}
