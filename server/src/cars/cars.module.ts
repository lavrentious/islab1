import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { CarsController } from "./cars.controller";
import { CarsService } from "./cars.service";
import { Car } from "./entities/car.entity";

@Module({
  imports: [MikroOrmModule.forFeature([Car])],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
