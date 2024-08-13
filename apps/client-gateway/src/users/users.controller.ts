import { Body, Controller, Delete, Get, Inject, Param, Patch, Post } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { RecoveryEmailDto } from 'apps/common/mails/recovery-email.dto';
import { CreateUserDto, LoginUserDto, ModifyUserDto } from 'apps/common/users';
import { InteractionDto } from 'apps/common/users/register-interaction.dto';
import { NATS_SERVICE } from 'apps/config';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
    constructor(
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
    ) {}
        
    @Get('recoveryCode')
    async sendRecoveryEmail(@Body() recoveryEmailDto: RecoveryEmailDto) {
        try {
            return await firstValueFrom( this.client.send('send_recovery_email', recoveryEmailDto) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post('create')
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            const result = await firstValueFrom( this.client.send('create_user', createUserDto) );
            return result;
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post('login')
    async login(@Body() loginUserDto: LoginUserDto) {
        try {
            return await firstValueFrom( this.client.send('login_user', loginUserDto) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        try {
            const user = await firstValueFrom( this.client.send('get_user_by_id', { id } ) );
            return user;
        } catch (error) {
            throw new RpcException(error);
        } 
    }

    @Delete(':id')
    async deleteUser(@Param('id') id: string) {
        try {
            return await firstValueFrom( this.client.send('delete_user', { id }) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Post('interaction')
    async registerInteraction(@Body() interactionDto: InteractionDto) {
        try {
            return await firstValueFrom( this.client.send('register_interaction', interactionDto) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Get('interaction/:userId')
    async getAllInteractionsByUserId(@Param('userId') userId: string) {
        try {
            return await firstValueFrom( this.client.send('get_all_interactions_by_userid', { userId }) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

    @Patch()
    async modifyUser(@Body() modifyUserDto: ModifyUserDto) {
        try {
            return await firstValueFrom( this.client.send('modify_user', modifyUserDto) );
        } catch (error) {
            throw new RpcException(error);
        }
    }

}