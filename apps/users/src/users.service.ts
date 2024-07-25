import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'apps/common/users';

@Injectable()
export class UsersService {
  createUser(createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
