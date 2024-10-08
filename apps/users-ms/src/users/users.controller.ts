import { Controller, ParseUUIDPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto, LoginUserDto } from 'apps/common/users';
import { UsersService } from './users.service';
import { ModifyUserDto } from 'apps/common/users/modify-user.dto';
import { RecoveryEmailDto } from 'apps/common/mails/recovery-email.dto';
import { InteractionDto } from 'apps/common/users/register-interaction.dto';

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

    @MessagePattern('register_interaction')
    registerInteraction(@Payload() interactionDto: InteractionDto) {
        return this.usersService.registerInteraction(interactionDto);
    }

    @MessagePattern('get_all_interactions_by_userid')
    getAllInteractionsByUserId(@Payload('userId') userId: string) {
        return this.usersService.getAllInteractionsByUserId(userId);
    }

    @MessagePattern('modify_user')
    modifyUser(@Payload() modifyUserDto: ModifyUserDto) {
        return this.usersService.modifyUser(modifyUserDto);
    }

    @MessagePattern('login_user')
    loginUser(@Payload() loginUserDto: LoginUserDto) {
        return this.usersService.loginUser(loginUserDto);
    }

    @MessagePattern('send_recovery_email')
    sendRecoveryEmail(@Payload() recoveryEmailDto: RecoveryEmailDto) {
        return this.usersService.sendRecoveryCode(recoveryEmailDto)
    }

}
