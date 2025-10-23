import type { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('database.host'),
    port: configService.get<number>('database.port'),
    username: configService.get<string>('database.username'),
    password: configService.get<string>('database.password'),
    database: configService.get<string>('database.database'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false, // Desactivado para evitar conflictos - usar migraciones
    logging: configService.get<string>('NODE_ENV') === 'development',
    ssl: configService.get<boolean>('database.ssl') || false,
    extra: {
      max: 10, // Máximo de conexiones
      min: 2, // Mínimo de conexiones
      connectionTimeoutMillis: 10000, // 10 segundos
      idleTimeoutMillis: 30000, // 30 segundos
    },
    // Configuración para mejor manejo de errores
    retryAttempts: 3,
    retryDelay: 3000,
    autoLoadEntities: true,
  };
};
