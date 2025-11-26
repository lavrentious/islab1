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
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginateResponse } from "src/common/dto/pagination.dto";
import { AssignCarToCarlessQueryParamsDto } from "./dto/assign-car-to-carless-query-params.dto";
import { CountImpactSpeedLessThanQueryParamsDto } from "./dto/count-impact-speed-less-than-query-params.dto";
import { CreateHumanBeingDto } from "./dto/create-humanbeing.dto";
import { FindAllHumanbeingsQueryParamsDto } from "./dto/find-all-humanbeings-query-params.dto";
import { GroupByCarDto, GroupByCarItem } from "./dto/group-by-car.dto";
import { HumanBeingDto } from "./dto/humanbeing.dto";
import { UpdateHumanBeingDto } from "./dto/update-humanbeing.dto";
import { HumanBeingsService } from "./humanbeings.service";

@ApiTags("Human Beings")
@Controller("humanbeings")
export class HumanBeingsController {
  constructor(private readonly service: HumanBeingsService) {}

  // CRUD

  @ApiOperation({ summary: "Create human being" })
  @ApiResponse({
    status: 201,
    type: HumanBeingDto,
    description: "Human created successfully",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post()
  async create(@Body() dto: CreateHumanBeingDto): Promise<HumanBeingDto> {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: "Find all human beings" })
  @ApiResponse({
    status: 200,
    type: PaginateResponse<HumanBeingDto>,
    description: "Success",
  })
  @Get()
  async findAll(
    @Query() params: FindAllHumanbeingsQueryParamsDto,
  ): Promise<PaginateResponse<HumanBeingDto>> {
    return this.service.findAll(params);
  }

  @ApiOperation({ summary: "Find human being by id" })
  @ApiResponse({
    status: 200,
    type: HumanBeingDto,
    description: "Human found successfully",
  })
  @ApiResponse({ status: 404, description: "Human being not found." })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<HumanBeingDto> {
    return this.service.findOneOrFail(+id);
  }

  @Get(":id/twice")
  async findTwice(@Param("id") id: string) {
    return this.service.getTwice(+id);
  }

  @ApiOperation({ summary: "Find human being's chain of versions" })
  @ApiResponse({
    status: 200,
    type: [HumanBeingDto],
    description: "Human found successfully",
  })
  @ApiResponse({ status: 404, description: "Human being not found." })
  @Get(":id/versions")
  async findVersions(@Param("id") id: string): Promise<HumanBeingDto[]> {
    return this.service.findVersions(+id);
  }

  @ApiOperation({ summary: "Update human being" })
  @ApiResponse({ status: 404, description: "Human being not found." })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({
    status: 200,
    type: HumanBeingDto,
    description: "Human updated successfully",
  })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateHumanBeingDto,
  ): Promise<HumanBeingDto> {
    return this.service.update(+id, dto);
  }

  @ApiResponse({ status: 404, description: "Human being not found." })
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return this.service.remove(+id);
  }

  // special

  @ApiResponse({
    status: 200,
    type: [GroupByCarItem],
    description: "Success",
  })
  @Get("/special/group-by-car")
  async groupByCar(): Promise<GroupByCarDto> {
    return this.service.groupByCar();
  }

  @ApiResponse({
    status: 200,
    type: Number,
    description: "Success",
  })
  @Get("/special/impact-speed-less-than")
  async countImpactSpeedLessThan(
    @Query() params: CountImpactSpeedLessThanQueryParamsDto,
  ): Promise<number> {
    return this.service.countImpactSpeedLessThan(params.threshold);
  }

  @ApiResponse({
    status: 200,
    type: Number,
    description: "Success",
  })
  @Delete("/special/delete-without-toothpicks")
  async deleteWithoutToothpicks(): Promise<number> {
    return this.service.deleteWithoutToothpicks();
  }

  @ApiResponse({
    status: 200,
    type: Number,
    description: "Success",
  })
  @Post("/special/assign-car-to-carless")
  async assignCarToCarless(
    @Body() params: AssignCarToCarlessQueryParamsDto,
  ): Promise<number> {
    return this.service.assignCarToCarless(params.car);
  }
}
