import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata): Promise<any> {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype as ClassConstructor<object>, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new BadRequestException({
        message: 'Errores de validación',
        errors: formattedErrors,
      });
    }
    return object;
  }

  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    errors.forEach((error) => {
      if (error.constraints) {
        formattedErrors[error.property] = Object.values(error.constraints);
      } else if (error.children && error.children.length > 0) {
        // Manejar errores anidados
        const nestedErrors = this.formatErrors(error.children);
        Object.keys(nestedErrors).forEach((key) => {
          formattedErrors[`${error.property}.${key}`] = nestedErrors[key];
        });
      } else {
        formattedErrors[error.property] = [`Validación fallida para ${error.property}`];
      }
    });

    return formattedErrors;
  }

  private toValidate(metatype: ClassConstructor<any> | undefined): boolean {
    const types: Array<ClassConstructor<any>> = [String, Boolean, Number, Array, Object];
    return metatype ? !types.includes(metatype) : false;
  }
}
