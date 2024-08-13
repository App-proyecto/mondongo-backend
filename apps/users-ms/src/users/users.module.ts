import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/user.schema';
import { EmailSender } from 'apps/common/mails/send-mails';
import { NatsModule } from 'apps/transports/nats.module';
import { UserInteraction, UserInteractionSchema } from '../schemas/user-interactions.schema';

@Module({
  imports: [MongooseModule.forFeature([ { name:User.name, schema:UserSchema }, {name:UserInteraction.name, schema:UserInteractionSchema } ]),NatsModule],
  controllers: [UsersController],
  providers: [UsersService, EmailSender]
})
export class UsersModule {}
