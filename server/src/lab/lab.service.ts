import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginateResponse } from "src/common/dto/pagination.dto";
import {
  calculateTotalPages,
  paginateParamsToQuery,
} from "src/common/utils/pagination.utils";
import { CreateHumanBeingDto } from "./dto/create-humanbeing.dto";
import { FindAllHumanbeingsQueryParamsDto } from "./dto/find-all-humanbeings-query-params.dto";
import { UpdateHumanBeingDto } from "./dto/update-humanbeing.dto";
import { HumanBeing } from "./entities/humanbeing";

@Injectable()
export class LabService {
  constructor(
    private readonly em: EntityManager,
    @InjectRepository(HumanBeing)
    private readonly humanBeingRepo: EntityRepository<HumanBeing>,
  ) {}

  async create(dto: CreateHumanBeingDto): Promise<HumanBeing> {
    const humanBeing = this.humanBeingRepo.create(
      dto as Omit<HumanBeing, "id">,
    );
    await this.em.flush();

    return humanBeing;
  }

  async findAll(
    params: FindAllHumanbeingsQueryParamsDto,
  ): Promise<PaginateResponse<HumanBeing>> {
    const paginateQuery = paginateParamsToQuery<HumanBeing>(params);
    const totalItems = await this.humanBeingRepo.count();
    let items: HumanBeing[];
    if (params.paginate && params.page && params.limit && paginateQuery) {
      items = await this.humanBeingRepo.findAll({ ...paginateQuery });
    } else {
      items = await this.humanBeingRepo.findAll({});
    }

    const limit = params.limit ?? totalItems;
    const page = params.page ?? 1;
    const totalPages = calculateTotalPages(totalItems, limit);

    return {
      items,
      limit,
      page,
      totalItems,
      totalPages,
    };
  }

  async findOne(id: number): Promise<HumanBeing | null> {
    return this.humanBeingRepo.findOne({ id });
  }

  async findOneOrFail(id: number): Promise<HumanBeing> {
    return this.humanBeingRepo.findOneOrFail(
      { id },
      {
        failHandler: () =>
          new NotFoundException(`Human being #${id} not found`),
      },
    );
  }

  async update(id: number, dto: UpdateHumanBeingDto) {
    const entity = await this.humanBeingRepo.findOneOrFail({ id });
    this.humanBeingRepo.assign(entity, dto);
    await this.em.flush();
    return entity;
  }

  async exists(id: number): Promise<boolean> {
    return (await this.humanBeingRepo.count({ id })) == 1;
  }

  async remove(id: number): Promise<void> {
    const deleted = await this.humanBeingRepo.nativeDelete({ id });
    if (deleted === 0) {
      throw new NotFoundException(`Human being #${id} not found`);
    }
  }
}
