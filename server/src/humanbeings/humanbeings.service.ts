import { InjectRepository } from "@mikro-orm/nestjs";
import {
  EntityManager,
  EntityRepository,
  FilterQuery,
  IsolationLevel,
  Loaded,
} from "@mikro-orm/postgresql";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import { retryTransaction } from "./utils";

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

    const humanBeing = await retryTransaction(
      async () =>
        this.em.transactional(
          async (tx) => {
            if (dto.car) {
              if (typeof dto.car === "number") {
                car = await tx.findOneOrFail(
                  Car,
                  { id: dto.car },
                  {
                    failHandler: () =>
                      new BadRequestException(
                        `Car #${dto.car as number} not found`,
                      ),
                  },
                );
              } else {
                car = await this.carsService.create(dto.car);
              }
            }

            const existing = await tx.findOne(HumanBeing, { name: dto.name });
            if (existing) {
              throw new BadRequestException(
                `Human being with name "${dto.name}" already exists`,
              );
            }

            const humanBeing = tx.create(HumanBeing, { ...dto, car } as Omit<
              HumanBeing,
              "id"
            >);
            await tx.persistAndFlush(humanBeing);
            return humanBeing;
          },
          { isolationLevel: IsolationLevel.SERIALIZABLE },
        ),
      10,
      1000,
    );

    return new HumanBeingDto(humanBeing);
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

    if (params.onlyLatestVersions) {
      where._next_version = null;
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

    const humanBeing = await retryTransaction(
      async () =>
        this.em.transactional(
          async (tx) => {
            const entity = await tx.findOneOrFail(
              HumanBeing,
              { id },
              {
                failHandler: () =>
                  new NotFoundException(`Human being #${id} not found`),
              },
            );

            if (dto.name && dto.name !== entity.name) {
              const existing = await tx.findOne(HumanBeing, { name: dto.name });
              if (existing && existing.id !== id) {
                throw new BadRequestException(
                  `Human being with name "${dto.name}" already exists`,
                );
              }
              // name changed => assume it's not in the same version set anymore
              // rechain
              await this._detachFromVersionChain(entity, tx);
              entity._next_version = null;
              entity._version_root = null;
              entity._version = 0;
              tx.persist(entity);
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { car: _, ...rest } = dto;
            const data: Partial<Loaded<HumanBeing>> = { ...rest };

            if (dto.car !== undefined) {
              if (!dto.car) {
                data.car = null;
              } else if (typeof dto.car === "number") {
                data.car = await tx.findOneOrFail(
                  Car,
                  { id: dto.car },
                  {
                    failHandler: () =>
                      new BadRequestException(
                        `Car #${dto.car as number} not found`,
                      ),
                  },
                );
              } else {
                data.car = await this.carsService.create(dto.car);
              }
            }

            tx.assign(entity, data);
            await tx.flush();

            return entity;
          },
          { isolationLevel: IsolationLevel.SERIALIZABLE },
        ),
      10,
      1000,
    );

    if (humanBeing) {
      return new HumanBeingDto(humanBeing);
    }

    throw new InternalServerErrorException();
  }

  async exists(id: number): Promise<boolean> {
    return (await this.repo.count({ id })) == 1;
  }

  async findVersions(id: number): Promise<HumanBeingDto[]> {
    const humanBeing = await this.findOneOrFail(id);
    const rootId = humanBeing._version_root ?? id;
    const versions = await this.repo.find(
      {
        $or: [{ id: rootId }, { _version_root: rootId }],
      },
      { orderBy: { _version: "asc" }, populate: false },
    );
    return versions.map((item) => new HumanBeingDto(item));
  }

  async remove(id: number): Promise<void> {
    return this.em.transactional(
      async (tx) => {
        const humanBeing = await tx.findOneOrFail(
          HumanBeing,
          { id },
          {
            failHandler: () =>
              new NotFoundException(`Human being #${id} not found`),
          },
        );

        // rechain version linked list
        await this._detachFromVersionChain(humanBeing, tx);

        // delete entity
        tx.remove(humanBeing);

        await tx.flush();
      },
      { isolationLevel: IsolationLevel.SERIALIZABLE },
    );
  }

  /**
   * fix linked list by rechaining after deleting the given node
   * doesn't flush, so do `await em.flush()` after usage!
   * @param humanBeing
   * @param em
   */
  async _detachFromVersionChain(humanBeing: HumanBeing, em: EntityManager) {
    const prevVersion = await em.findOne(HumanBeing, {
      _next_version: humanBeing,
    });
    const nextVersion = humanBeing._next_version;

    // link prev and next
    if (prevVersion) {
      prevVersion._next_version = nextVersion ?? null;
      em.persist(prevVersion);
    }

    // if root then rechain
    if (!humanBeing._version_root && nextVersion) {
      console.log("root");
      nextVersion._version_root = null;
      em.persist(nextVersion);

      const descendants = await em.find(HumanBeing, {
        _version_root: humanBeing,
      });
      for (const d of descendants) {
        console.log("setting version root to ", nextVersion.id, "for ", d.id);
        d._version_root = nextVersion;
      }
      em.persist(descendants);
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
