import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateUserDto } from 'apps/common/users';
import { NATS_SERVICE } from 'apps/config';

@Controller('users')
export class UsersController {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    ) {}
    
    @Post()
    getHelloWorld(@Body() createUserDto: CreateUserDto) {
        return this.client.send('create_user', createUserDto)
    }
}




