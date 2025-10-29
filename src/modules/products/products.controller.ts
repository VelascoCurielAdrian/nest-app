import { Controller, Get } from '@nestjs/common';

import { CurrentUser } from '../auth';

@Controller('products')
export class ProductsController {
  @Get()
  findAll(@CurrentUser() user: { sub: string; username: string }) {
    return {
      message: 'Products endpoint - user authenticated',
      user,
      products: [],
    };
  }

  @Get('profile')
  getProfile(@CurrentUser() user: { sub: string; username: string }) {
    return {
      message: 'User profile from products module',
      user,
    };
  }
}
