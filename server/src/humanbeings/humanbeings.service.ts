import { InjectRepository } from "@mikro-orm/nestjs";
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  Loaded,
} from "@mikro-orm/postgresql";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CarsService } from "src/cars/cars.service";
import { Car } from "src/cars/entities/car.entity";
import { PaginateResponse } from "src/common/dto/pagination.dto";
import {
  calculateTotalPages,
  paginateParamsToQuery,
} from "src/common/utils/pagination.utils";
import { CreateHumanBeingDto } from "./dto/create-humanbeing.dto";
import { FindAllHumanbeingsQueryParamsDto } from "./dto/find-all-humanbeings-query-params.dto";
import { GroupByCarDto } from "./dto/group-by-car.dto";
import { HumanBeingDto } from "./dto/humanbeing.dto";
import { UpdateHumanBeingDto } from "./dto/update-humanbeing.dto";
import { HumanBeing, WeaponType } from "./entities/humanbeing.entity";

@Injectable()
export class HumanBeingsService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(HumanBeing)
    private readonly repo: EntityRepository<HumanBeing>,
    private readonly carsService: CarsService,
  ) {}

  // CRUD

  async create(dto: CreateHumanBeingDto): Promise<HumanBeingDto> {
    let car: Car | null = null;
    if (dto.car) {
      car = await this.em.findOneOrFail(
        Car,
        { id: dto.car },
        {
          failHandler: () =>
            new BadRequestException(`Car #${dto.car} not found`),
        },
      );
    }

    const humanBeing = this.repo.create({ ...dto, car } as Omit<
      HumanBeing,
      "id"
    >);
    await this.em.flush();

    return this.findOneOrFail(humanBeing.id);
  }

  async findAll(
    params: FindAllHumanbeingsQueryParamsDto,
  ): Promise<PaginateResponse<HumanBeingDto>> {
    const paginateQuery = paginateParamsToQuery<HumanBeing>(params);

    // filtering
    const where: FilterQuery<HumanBeing> = {};
    if (params.realHero !== undefined) {
      where.realHero = params.realHero;
    }
    if (params.hasToothpick !== undefined) {
      where.hasToothpick = params.hasToothpick;
    }
    if (params.mood !== undefined) {
      where.mood = params.mood;
    }
    if (params.weaponType !== undefined) {
      where.weaponType = params.weaponType;
    }
    if (params.name !== undefined) {
      where.name = { $ilike: `%${params.name}%` };
    }
    if (params.soundtrackName !== undefined) {
      where.soundtrackName = { $ilike: `%${params.soundtrackName}%` };
    }
    if (params.hasCar !== undefined) {
      if (params.hasCar) {
        where.car = { $ne: null };
      } else {
        where.car = null;
      }
    }
    if (params.hasCar !== false && params.carName !== undefined) {
      where.car = { name: { $ilike: `%${params.carName}%` } };
    }
    if (params.hasCar !== false && params.carCool !== undefined) {
      where.car = { ...(where.car as Partial<Car>), cool: params.carCool };
    }

    // sorting
    const orderBy: Record<string, "ASC" | "DESC"> = {};
    if (params.sortBy) orderBy[params.sortBy] = params.sortOrder || "ASC";

    // query
    let items: HumanBeing[];
    if (params.paginate && params.page && params.limit && paginateQuery) {
      items = await this.repo.findAll({
        ...paginateQuery,
        where,
        orderBy,
        populate: ["car"],
      });
    } else {
      items = await this.repo.findAll({ where, orderBy });
    }

    // pagination
    const totalItems = await this.repo.count(where);
    const limit = params.limit ?? totalItems;
    const page = params.page ?? 1;
    const totalPages = calculateTotalPages(totalItems, limit);

    // res
    return {
      items: items.map((item) => new HumanBeingDto(item)),
      limit,
      page,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: number): Promise<HumanBeingDto | null> {
    const entity = await this.repo.findOne({ id });
    return entity ? new HumanBeingDto(entity) : null;
  }

  async findOneOrFail(id: number): Promise<HumanBeingDto> {
    const entity = await this.repo.findOneOrFail(
      { id },
      {
        failHandler: () =>
          new NotFoundException(`Human being #${id} not found`),
      },
    );
    return new HumanBeingDto(entity);
  }

  async update(id: number, dto: UpdateHumanBeingDto): Promise<HumanBeingDto> {
    if (!dto || Object.keys(dto).length === 0) {
      throw new BadRequestException("Request body cannot be empty");
    }

    const entity = await this.repo.findOneOrFail(
      { id },
      {
        failHandler: () =>
          new NotFoundException(`Human being #${id} not found`),
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { car: _, ...rest } = dto;
    const data: Partial<Loaded<HumanBeing>> = { ...rest };
    if (dto.car !== undefined) {
      if (!dto.car) {
        data.car = null;
      } else {
        data.car = await this.em.findOneOrFail(
          Car,
          { id: dto.car },
          {
            failHandler: () =>
              new BadRequestException(`Car #${dto.car} not found`),
          },
        );
      }
    }

    this.repo.assign(entity, data);
    await this.em.flush();
    return new HumanBeingDto(entity);
  }

  async exists(id: number): Promise<boolean> {
    return (await this.repo.count({ id })) == 1;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.repo.nativeDelete({ id });
    if (deleted === 0) {
      throw new NotFoundException(`Human being #${id} not found`);
    }
  }

  // special functions

  async groupByCar() {
    const result = await this.em
      .getConnection()
      .execute("SELECT * FROM group_by_car()");
    return result as GroupByCarDto;
  }

  async countImpactSpeedLessThan(threshold: number) {
    const [{ count_impact_speed_less_than }] = await this.em
      .getConnection()
      .execute("SELECT count_impact_speed_less_than(?)", [threshold]);
    return +count_impact_speed_less_than;
  }

  async uniqueWeaponTypes() {
    const [{ unique_weapon_types }] = await this.em
      .getConnection()
      .execute("SELECT unique_weapon_types()");
    return unique_weapon_types as WeaponType[];
  }

  async deleteWithoutToothpicks() {
    const [{ delete_without_toothpicks }] = await this.em
      .getConnection()
      .execute("SELECT delete_without_toothpicks()");
    return +delete_without_toothpicks;
  }

  async assignCarToCarless(id: number): Promise<number> {
    const car = await this.carsService.findOne(id);
    if (!car) {
      throw new NotFoundException(`Car #${id} not found`);
    }

    const [{ assign_car_to_carless }] = await this.em.execute(
      `SELECT assign_car_to_carless(?)`,
      [id],
    );
    return +assign_car_to_carless;
  }
}
