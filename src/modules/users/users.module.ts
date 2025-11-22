import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from './entities/profile.entity';
import { UserProfile } from './entities/user-profile.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

// Módulo que encapsula la funcionalidad relacionada con los usuarios
// Define las entidades, controladores y servicios asociados
// Importa TypeOrmModule para gestionar las entidades User, UserProfile y Profile
// Exporta UsersService para que pueda ser utilizado en otros módulos
// Proporciona UsersController para manejar las rutas relacionadas con usuarios
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, // Entidad principal de usuario
      UserProfile, // Entidad que probablemente vincula User con Profile
      Profile, // Entidad de perfil con información adicional
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
