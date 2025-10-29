import { SetMetadata } from '@nestjs/common';

import { IS_PUBLIC_KEY } from '../guards/auth.guard';

/**
 * Decorador para marcar rutas como públicas (sin autenticación requerida)
 * @example
 * @Public()
 * @Get('public-route')
 * publicMethod() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
