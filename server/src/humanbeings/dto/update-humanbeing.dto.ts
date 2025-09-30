import { PartialType } from "@nestjs/mapped-types";
import { CreateHumanBeingDto } from "./create-humanbeing.dto";

export class UpdateHumanBeingDto extends PartialType(CreateHumanBeingDto, {
  skipNullProperties: false,
}) {}
