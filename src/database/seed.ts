import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../app.module';
import { seedMasterUser } from './seeds/master-user.seed';
import { seedPermissionsSystem } from './seeds/permissions-system.seed';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const dataSource = app.get(DataSource);

    console.info('📦 Running database seed...\n');
    // 1. Crear usuario master y perfil
    await seedMasterUser(dataSource);
    // 2. Crear sistema de permisos y asignarlos al perfil Master
    await seedPermissionsSystem(dataSource);
    console.info('\n🎉 Seed process finished!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

void runSeed();
