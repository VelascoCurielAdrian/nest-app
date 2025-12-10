import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Public, CurrentUser } from './modules/auth';

// Controlador principal de la aplicación
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('protected')
  getProtected(@CurrentUser() user: { sub: string; username: string }) {
    return {
      message: 'This is a protected route',
      user,
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('public')
  getPublic() {
    return {
      message: 'This is a public route - no authentication required',
      timestamp: new Date().toISOString(),
    };
  }
}
