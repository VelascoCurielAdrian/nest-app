import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateProductsDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
