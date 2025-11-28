import bcrypt from 'bcryptjs';

import { AppDataSource } from './data-source';
import { Profile } from '../modules/users/entities/profile.entity';
import { UserProfile } from '../modules/users/entities/user-profile.entity';
import { User } from '../modules/users/entities/user.entity';

async function seed() {
  const dataSource = AppDataSource;

  await dataSource.initialize();

  await dataSource.transaction(async (manager) => {
    try {
      // Limpiar tablas en el orden correcto para evitar errores de FK
      await manager.createQueryBuilder().delete().from(UserProfile).execute();
      await manager.createQueryBuilder().delete().from(User).execute();
      await manager.createQueryBuilder().delete().from(Profile).execute();

      // Crear perfil Master
      const profile = manager.create(Profile, {
        name: 'Master',
        description: 'Perfil master con todos los permisos',
        status: true,
      });
      await manager.save(profile);

      // Crear usuario master
      const passwordAdmin = await bcrypt.hash('Luchi@_@321', 10);
      const user = manager.create(User, {
        username: 'master',
        password: passwordAdmin,
        status: true,
      });
      await manager.save(user);

      // Crear relación usuario-perfil
      const userProfile = manager.create(UserProfile, {
        user_id: user.id,
        profile_id: profile.id,
        email: 'adrian_velascocuriel@hotmail.com',
        first_name: 'Adrian',
        last_name: 'Velasco Curiel',
        gender: 'male',
        local_number: '+52',
        phone_number: '6672466130',
        avatar_url: '',
      });
      await manager.save(userProfile);

      console.info('✅ Seed completed successfully:');
      console.info(`- Profile created: ${profile.name} (ID: ${profile.id})`);
      console.info(`- User created: master`);
      console.info(`- UserProfile created for user ${user.username}`);

      // Nota: app_permissions no implementado aún, ya que la entidad no coincide con el código proporcionado
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  });

  await dataSource.destroy();
}

seed().catch(console.error);
// npx ts-node src/database/initial-data.ts
