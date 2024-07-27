import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from 'apps/config';

@Module({
  imports: [UsersModule, MongooseModule.forRoot(envs.databaseUrl)],
})
export class UsersMsModule {}
