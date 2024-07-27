import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/common/users';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private readonly usersService: UsersService) {}

    @MessagePattern('create_user')
    createUser(@Payload() createUserDto: CreateUserDto) {
        return this.usersService.createUser(createUserDto);
    }

    @MessagePattern('get_user_by_id')
    getUserById(@Payload('id') id: string) {
        return this.usersService.getUserById(id);
    }

    @MessagePattern('delete_user')
    deleteUser(@Payload('id') id: string) {
        return this.usersService.deleteUser(id);
    }

}
