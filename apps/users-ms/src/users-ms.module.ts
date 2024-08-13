import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { envs } from 'apps/config';
import { NatsModule } from 'apps/transports/nats.module';

@Module({
  imports: [UsersModule, MongooseModule.forRoot(envs.databaseUrl+"/users"), NatsModule],
})
export class UsersMsModule {}
