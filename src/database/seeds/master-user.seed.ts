import * as bcrypt from 'bcryptjs';

import { Profile } from '../../modules/users/entities/profile.entity';
import { UserProfile } from '../../modules/users/entities/user-profile.entity';
import { User } from '../../modules/users/entities/user.entity';

import type { DataSource } from 'typeorm';

export async function seedMasterUser(dataSource: DataSource): Promise<void> {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.info('🌱 Starting seed...');

    // Obtener repositorios
    const profileRepository = queryRunner.manager.getRepository(Profile);
    const userRepository = queryRunner.manager.getRepository(User);
    const userProfileRepository = queryRunner.manager.getRepository(UserProfile);

    // Limpiar tablas en el orden correcto para evitar errores de FK
    await userProfileRepository.delete({});
    await userRepository.delete({});
    await profileRepository.delete({});

    console.info('✅ Tables cleaned');

    // Crear perfil Master
    const profile = profileRepository.create({
      name: 'Master',
      description: 'Perfil master con todos los permisos',
      status: true,
    });
    await profileRepository.save(profile);

    console.info(`✅ Profile created: ${profile.name} (ID: ${profile.id})`);

    // Crear usuario master con contraseña hasheada
    const passwordHash = await bcrypt.hash('321', 10);
    const user = userRepository.create({
      username: 'master',
      password: passwordHash,
      status: true,
    });

    await userRepository.save(user);

    console.info(`✅ User created: ${user.username} (ID: ${user.id})`);

    // Crear perfil de usuario (user_profile)
    const userProfile = userProfileRepository.create({
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
    await userProfileRepository.save(userProfile);

    console.info('✅ User profile created');

    await queryRunner.commitTransaction();

    console.info('');
    console.info('✅ Seed completed successfully:');
    console.info(`- Profile: ${profile.name} (ID: ${profile.id})`);
    console.info(`- User: ${user.username}`);
    console.info(`- Email: ${userProfile.email}`);
    console.info(`- Password: 321`);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
