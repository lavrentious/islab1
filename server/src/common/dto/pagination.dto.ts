import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, Min, ValidateIf } from "class-validator";

export class PaginateParams {
  @ApiPropertyOptional({ default: false })
  @Transform(({ value }) => value === true || value === "true")
  @ValidateIf((_, value) => typeof value !== "boolean")
  @IsOptional()
  paginate?: boolean = false;

  @ApiPropertyOptional()
  @Transform(({ value }: { value?: string | null }) =>
    value == null ? undefined : +value,
  )
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }: { value?: string | null }) =>
    value == null ? undefined : +value,
  )
  @Min(1)
  @IsNumber()
  @IsOptional()
  limit?: number;
}

export class PaginateResponse<T> {
  @ApiProperty() // FIXMIE
  items: T[];

  @ApiProperty()
  limit: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  totalItems: number;

  @ApiProperty()
  totalPages: number;
}
