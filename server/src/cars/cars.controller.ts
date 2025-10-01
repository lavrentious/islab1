import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { CarsService } from "./cars.service";
import { CreateCarDto } from "./dto/create-car.dto";
import { FindAllCarsQueryParamsDto } from "./dto/find-all-cars-query-params.dto";
import { UpdateCarDto } from "./dto/update-car.dto";

@Controller("cars")
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  create(@Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto);
  }

  @Get()
  findAll(@Query() params: FindAllCarsQueryParamsDto) {
    return this.carsService.findAll(params);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.carsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carsService.update(+id, updateCarDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.carsService.remove(+id);
  }
}
