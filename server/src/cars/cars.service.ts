import { InjectRepository } from "@mikro-orm/nestjs";
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  IsolationLevel,
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
import { HumanBeing } from "src/humanbeings/entities/humanbeing.entity";
import { retryTransaction } from "src/humanbeings/utils";
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

  // --- Internal methods (with optional em) ---
  async _create(dto: CreateCarDto, em: EntityManager = this.em): Promise<Car> {
    const car = await retryTransaction(async () =>
      em.transactional(
        async (tx) => {
          const existing = await tx.count(Car, { name: dto.name });
          if (existing > 0) {
            throw new BadRequestException(
              `Car with name "${dto.name}" already exists`,
            );
          }
          const car = tx.create(Car, dto as Omit<Car, "id">);
          await tx.persistAndFlush(car);
          return car;
        },
        { isolationLevel: IsolationLevel.SERIALIZABLE },
      ),
    );
    return car;
  }

  async _findOne(id: number, em: EntityManager = this.em): Promise<Car | null> {
    return em.findOne(Car, { id });
  }

  async _findOneOrFail(id: number, em: EntityManager = this.em): Promise<Car> {
    const car = await em.findOneOrFail(
      Car,
      { id },
      {
        failHandler: () => new NotFoundException(`Car #${id} not found`),
      },
    );
    return car;
  }

  // --- Public methods (no em argument, return DTOs) ---
  async create(dto: CreateCarDto): Promise<CarDto> {
    const car = await this._create(dto);
    return car.toDto();
  }

  async findAll(
    params: FindAllCarsQueryParamsDto,
  ): Promise<PaginateResponse<CarDto>> {
    const paginateQuery = paginateParamsToQuery<Car>(params);
    const where: FilterQuery<Car> = {};
    if (params.name !== undefined) where.name = { $ilike: `%${params.name}%` };
    if (params.cool !== undefined) where.cool = params.cool;

    const orderBy: Record<string, "ASC" | "DESC"> = {};
    if (params.sortBy) orderBy[params.sortBy] = params.sortOrder || "ASC";

    const items: Car[] =
      params.paginate && params.page && params.limit && paginateQuery
        ? await this.repo.findAll({ ...paginateQuery, where, orderBy })
        : await this.repo.findAll({ where, orderBy });

    const totalItems = await this.repo.count(where);
    const limit = params.limit ?? totalItems;
    const page = params.page ?? 1;
    const totalPages = calculateTotalPages(totalItems, limit);

    return {
      items: items.map((item) => item.toDto()),
      limit,
      page,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: number): Promise<CarDto | null> {
    const car = await this._findOne(id);
    return car ? car.toDto() : null;
  }

  async _exists(id: number, em: EntityManager = this.em): Promise<boolean> {
    const count = await em.count(Car, { id });
    return count > 0;
  }

  async _throwIfNotExists(
    id: number,
    em: EntityManager = this.em,
  ): Promise<void> {
    const exists = await this._exists(id, em);
    if (!exists) throw new NotFoundException(`Car #${id} not found`);
  }

  async throwIfNotExists(id: number): Promise<void> {
    return this._throwIfNotExists(id);
  }

  async findOneOrFail(id: number): Promise<CarDto> {
    const car = await this._findOneOrFail(id);
    return car.toDto();
  }

  async findOneByName(name: string): Promise<CarDto | null> {
    const result = await this.em.findOne(Car, { name });
    return result ? result.toDto() : null;
  }

  async update(id: number, dto: UpdateCarDto): Promise<CarDto> {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Request body cannot be empty");
    }
    const car = await retryTransaction(async () =>
      this.em.transactional(
        async (tx) => {
          const entity = await this._findOneOrFail(id, tx);
          tx.assign(entity, dto);
          await tx.persistAndFlush(entity);
          return entity;
        },
        { isolationLevel: IsolationLevel.SERIALIZABLE },
      ),
    );
    return car.toDto();
  }

  async remove(id: number) {
    await retryTransaction(async () =>
      this.em.transactional(
        async (tx) => {
          const car = await this._findOneOrFail(id, tx);
          const ownerCount = await tx.count(HumanBeing, { car: id });
          if (ownerCount) {
            throw new BadRequestException(
              `Car #${id} has ${ownerCount} owners and cannot be deleted`,
            );
          }
          await tx.removeAndFlush(car);
        },
        // { isolationLevel: IsolationLevel.SERIALIZABLE }, // OK
        // { isolationLevel: IsolationLevel.REPEATABLE_READ }, // OK
        { isolationLevel: IsolationLevel.READ_COMMITTED }, // phantom read
      ),
    );
  }
}
