import { plainToClass } from "class-transformer";
import {
  registerDecorator,
  validateSync,
  ValidationOptions,
} from "class-validator";
import { CreateCarDto } from "src/cars/dto/create-car.dto";

export function IsCarIdOrValidCarDto(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: "isCarIdOrValidCarDto",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // if car id
          if (typeof value === "number") {
            return Number.isInteger(value) && value > 0;
          }

          // if create car dto
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            const dto = plainToClass(CreateCarDto, value);
            const errors = validateSync(dto, {
              whitelist: true,
              forbidNonWhitelisted: true,
              skipMissingProperties: false,
            });
            return errors.length === 0;
          }

          return false;
        },
      },
    });
  };
}
