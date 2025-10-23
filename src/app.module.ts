import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { winstonOptions } from './common/logger/winston.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [WinstonModule.forRoot(winstonOptions), UsersModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
