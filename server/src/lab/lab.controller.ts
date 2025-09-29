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
import { CreateHumanBeingDto } from "./dto/create-humanbeing.dto";
import { FindAllHumanbeingsQueryParamsDto } from "./dto/find-all-humanbeings-query-params.dto";
import { UpdateHumanBeingDto } from "./dto/update-humanbeing.dto";
import { HumanBeing } from "./entities/humanbeing";
import { LabService } from "./lab.service";

@ApiTags("Lab (Human Beings)")
@Controller("lab")
export class LabController {
  constructor(private readonly labService: LabService) {}

  @ApiOperation({ summary: "Create human being" })
  @ApiResponse({ status: 201, description: "Human created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Post()
  async create(@Body() dto: CreateHumanBeingDto): Promise<HumanBeing> {
    return this.labService.create(dto);
  }

  @ApiOperation({ summary: "Find all human beings" })
  @ApiResponse({ status: 404, description: "Human being not found." })
  @Get()
  async findAll(
    @Query() params: FindAllHumanbeingsQueryParamsDto,
  ): Promise<PaginateResponse<HumanBeing>> {
    return this.labService.findAll(params);
  }

  @ApiOperation({ summary: "Find human being by id" })
  @ApiResponse({ status: 404, description: "Human being not found." })
  @Get(":id")
  async findOne(@Param("id") id: string): Promise<HumanBeing> {
    return this.labService.findOneOrFail(+id);
  }

  @ApiOperation({ summary: "Update human being" })
  @ApiResponse({ status: 404, description: "Human being not found." })
  @ApiResponse({ status: 400, description: "Bad request" })
  @ApiResponse({ status: 200, description: "Human updated successfully" })
  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateHumanBeingDto,
  ): Promise<HumanBeing> {
    return this.labService.update(+id, dto);
  }

  @ApiResponse({ status: 404, description: "Human being not found." })
  @Delete(":id")
  async remove(@Param("id") id: string): Promise<void> {
    return this.labService.remove(+id);
  }
}
