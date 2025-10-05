import { InjectRepository } from "@mikro-orm/nestjs";
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from "@mikro-orm/postgresql";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PaginateResponse } from "src/common/dto/pagination.dto";
import {
  calculateTotalPages,
  paginateParamsToQuery,
} from "src/common/utils/pagination.utils";
import { CarDto } from "./dto/car.dto";
import { CreateCarDto } from "./dto/create-car.dto";
import { FindAllCarsQueryParamsDto } from "./dto/find-all-cars-query-params.dto";
import { UpdateCarDto } from "./dto/update-car.dto";
import { Car } from "./entities/car.entity";

@Injectable()
export class CarsService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(Car)
    private readonly repo: EntityRepository<Car>,
  ) {}

  async create(dto: CreateCarDto) {
    const existing = await this.repo.count({ name: dto.name });
    if (existing > 0) {
      throw new BadRequestException(
        `Car with name "${dto.name}" already exists`,
      );
    }

    const car = this.repo.create(dto as Omit<Car, "id">);
    await this.em.flush();
    return car;
  }

  async findAll(
    params: FindAllCarsQueryParamsDto,
  ): Promise<PaginateResponse<CarDto>> {
    const paginateQuery = paginateParamsToQuery<Car>(params);

    //filtering
    const where: FilterQuery<Car> = {};
    if (params.name !== undefined) {
      where.name = { $ilike: `%${params.name}%` };
    }
    if (params.cool !== undefined) {
      where.cool = params.cool;
    }

    // sorting
    const orderBy: Record<string, "ASC" | "DESC"> = {};
    if (params.sortBy) orderBy[params.sortBy] = params.sortOrder || "ASC";

    // query
    let items: Car[];
    if (params.paginate && params.page && params.limit && paginateQuery) {
      items = await this.repo.findAll({
        ...paginateQuery,
        where,
        orderBy,
      });
    } else {
      items = await this.repo.findAll({ where, orderBy });
    }

    // pagination
    const totalItems = items.length;
    const limit = params.limit ?? totalItems;
    const page = params.page ?? 1;
    const totalPages = calculateTotalPages(totalItems, limit);

    // res
    return {
      items: items.map((item) => new CarDto(item)),
      limit,
      page,
      totalItems,
      totalPages,
    };
  }

  findOne(id: number) {
    return this.repo.findOneOrFail(
      { id },
      {
        failHandler: () => new NotFoundException(`Car #${id} not found`),
      },
    );
  }

  findOneByName(name: string) {
    return this.repo.findOne({ name });
  }

  async update(id: number, dto: UpdateCarDto) {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Request body cannot be empty");
    }

    const entity = await this.repo.findOneOrFail(
      { id },
      {
        failHandler: () => new NotFoundException(`Car #${id} not found`),
      },
    );
    this.repo.assign(entity, dto);
    await this.em.flush();
    return entity;
  }

  async remove(id: number) {
    const deleted = await this.repo.nativeDelete({ id });
    if (deleted === 0) {
      throw new NotFoundException(`Car #${id} not found`);
    }
  }
}
