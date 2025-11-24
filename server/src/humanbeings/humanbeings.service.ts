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

  // --- CRUD ---

  async create(dto: CreateHumanBeingDto): Promise<HumanBeingDto> {
    const humanBeing = await retryTransaction(async () =>
      this.em.transactional(
        async (tx) => {
          let car: Car | null = null;

          if (dto.car) {
            car =
              typeof dto.car === "number"
                ? await this.carsService._findOneOrFail(dto.car, tx)
                : await this.carsService._create(dto.car, tx);
          }

          const existing = await tx.count(HumanBeing, { name: dto.name });
          if (existing > 0) {
            throw new BadRequestException(
              `Human being with name "${dto.name}" already exists`,
            );
          }

          const entity = tx.create(HumanBeing, { ...dto, car } as Omit<
            HumanBeing,
            "id"
          >);
          await tx.persistAndFlush(entity);
          return entity;
        },
        { isolationLevel: IsolationLevel.SERIALIZABLE },
      ),
    );

    return new HumanBeingDto(humanBeing);
  }

  async findAll(
    params: FindAllHumanbeingsQueryParamsDto,
  ): Promise<PaginateResponse<HumanBeingDto>> {
    const paginateQuery = paginateParamsToQuery<HumanBeing>(params);

    const where: FilterQuery<HumanBeing> = {};

    if (params.realHero !== undefined) where.realHero = params.realHero;
    if (params.hasToothpick !== undefined)
      where.hasToothpick = params.hasToothpick;
    if (params.mood !== undefined) where.mood = params.mood;
    if (params.weaponType !== undefined) where.weaponType = params.weaponType;
    if (params.name !== undefined) where.name = { $ilike: `%${params.name}%` };
    if (params.soundtrackName !== undefined)
      where.soundtrackName = { $ilike: `%${params.soundtrackName}%` };

    if (params.hasCar !== undefined) {
      where.car = params.hasCar ? { $ne: null } : null;
    }

    if (params.hasCar !== false && params.carName !== undefined) {
      where.car = {
        ...(where.car as Partial<Car>),
        name: { $ilike: `%${params.carName}%` },
      };
    }

    if (params.hasCar !== false && params.carCool !== undefined) {
      where.car = { ...(where.car as Partial<Car>), cool: params.carCool };
    }

    if (params.onlyLatestVersions) {
      where._next_version = null;
    }

    const orderBy: Record<string, "ASC" | "DESC"> = {};
    if (params.sortBy) orderBy[params.sortBy] = params.sortOrder || "ASC";

    const items: HumanBeing[] =
      params.paginate && params.page && params.limit && paginateQuery
        ? await this.repo.findAll({
            ...paginateQuery,
            where,
            orderBy,
            populate: ["car"],
          })
        : await this.repo.findAll({ where, orderBy });

    const totalItems = await this.repo.count(where);
    const limit = params.limit ?? totalItems;
    const page = params.page ?? 1;
    const totalPages = calculateTotalPages(totalItems, limit);

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

  async _findOneOrFail(
    id: number,
    em: EntityManager = this.em,
  ): Promise<HumanBeing> {
    return em.findOneOrFail(
      HumanBeing,
      { id },
      {
        failHandler: () =>
          new NotFoundException(`Human being #${id} not found`),
      },
    );
  }

  async findOneOrFail(id: number): Promise<HumanBeingDto> {
    const entity = await this._findOneOrFail(id);
    return new HumanBeingDto(entity);
  }

  async update(id: number, dto: UpdateHumanBeingDto): Promise<HumanBeingDto> {
    if (!dto || Object.keys(dto).length === 0)
      throw new BadRequestException("Request body cannot be empty");

    const humanBeing = await retryTransaction(async () =>
      this.em.transactional(
        async (tx) => {
          const entity = await this._findOneOrFail(id, tx);

          if (dto.name && dto.name !== entity.name) {
            const existing = await tx.findOne(HumanBeing, { name: dto.name });
            if (existing && existing.id !== id) {
              throw new BadRequestException(
                `Human being with name "${dto.name}" already exists`,
              );
            }

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
            if (!dto.car) data.car = null;
            else if (typeof dto.car === "number") {
              data.car = await this.carsService._findOneOrFail(dto.car, tx);
            } else {
              data.car = await this.carsService._create(dto.car, tx);
            }
          }

          tx.assign(entity, data);
          await tx.flush();
          return entity;
        },
        { isolationLevel: IsolationLevel.SERIALIZABLE },
      ),
    );

    return new HumanBeingDto(humanBeing);
  }

  async exists(id: number): Promise<boolean> {
    return (await this.repo.count({ id })) === 1;
  }

  async findVersions(id: number): Promise<HumanBeingDto[]> {
    const humanBeing = await this.findOneOrFail(id);
    const rootId = humanBeing._version_root ?? id;
    const versions = await this.repo.find(
      { $or: [{ id: rootId }, { _version_root: rootId }] },
      { orderBy: { _version: "asc" }, populate: false },
    );
    return versions.map((item) => new HumanBeingDto(item));
  }

  async remove(id: number): Promise<void> {
    return this.em.transactional(
      async (tx) => {
        const humanBeing = await this._findOneOrFail(id, tx);
        await this._detachFromVersionChain(humanBeing, tx);
        tx.remove(humanBeing);
        await tx.flush();
      },
      { isolationLevel: IsolationLevel.SERIALIZABLE },
    );
  }

  // --- Helpers ---

  async _detachFromVersionChain(humanBeing: HumanBeing, em: EntityManager) {
    const prevVersion = await em.findOne(HumanBeing, {
      _next_version: humanBeing,
    });
    const nextVersion = humanBeing._next_version;

    if (prevVersion) {
      prevVersion._next_version = nextVersion ?? null;
      em.persist(prevVersion);
    }

    if (!humanBeing._version_root && nextVersion) {
      nextVersion._version_root = null;
      em.persist(nextVersion);

      const descendants = await em.find(HumanBeing, {
        _version_root: humanBeing,
      });
      for (const d of descendants) {
        d._version_root = nextVersion;
      }
      em.persist(descendants);
    }
  }

  // --- Special functions ---

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
    await this.carsService.throwIfNotExists(id);
    const [{ assign_car_to_carless }] = await this.em.execute(
      `SELECT assign_car_to_carless(?)`,
      [id],
    );
    return +assign_car_to_carless;
  }
}
