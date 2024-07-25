import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/common/users';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('create_user')
  createUser(@Payload() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

}
