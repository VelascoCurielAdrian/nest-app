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
  create(createProductsDto: any): Promise<IProducts>;
  update(id: string, updateProductsDto: any): Promise<IProducts>;
  remove(id: string): Promise<void>;
}
