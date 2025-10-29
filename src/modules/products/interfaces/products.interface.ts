import type { CreateProductsDto } from '../dto/create-products.dto';
import type { UpdateProductsDto } from '../dto/update-products.dto';

export interface IProducts {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductsService {
  findAll(): Promise<IProducts[]>;
  findOne(id: string): Promise<IProducts>;
  create(createProductsDto: CreateProductsDto): Promise<IProducts>;
  update(id: string, updateProductsDto: UpdateProductsDto): Promise<IProducts>;
  remove(id: string): Promise<void>;
}
