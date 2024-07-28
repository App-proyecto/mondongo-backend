import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'apps/common/users';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { ModifyUserDto } from 'apps/common/users/modify-user.dto';

@Injectable()
export class UsersService {
    constructor( @InjectModel(User.name) private UserModel: Model<User>) {}

    async createUser(createUserDto: CreateUserDto) {
        // Se busca el usuaro mediante el email, de encontrarse se lanza una excepcion
        await this.existEmail(createUserDto.email);

        return await this.UserModel.create(createUserDto);
    }

    async getUserById(id: string) {
        const user = await this.UserModel.findById(id);
        // Si el usuario no existe
        if ( !user ) {
            throw new RpcException( { status:HttpStatus.NOT_FOUND, message: `User with id ${id} not found` } );
        }
        // Si al usuario se le aplico un softdelete
        if ( user.deleted ) {
            throw new RpcException( { status: HttpStatus.NOT_FOUND, message: `User with id ${id} soft deleted` } );
        }
        return user;
    }

    async deleteUser(id: string) {
        // Se busca el usuario, si no existe se lanzaran las excepciones de la funcion
        await this.getUserById(id);

        // Buscar el usuario donde el id coincida y cambiar el cambio deleted a true
        return await this.UserModel.updateOne({ _id: id }, { $set: { deleted: true } });
    }

    async modifyUser(modifyUserDto: ModifyUserDto) {
        // Separar el id de los dato a actualizar
        const {id, ...updateFields} = modifyUserDto;

        // Se busca el usuario, si no existe se lanzaran las excepciones de la funcion
        await this.getUserById(id);

        // Si el modifyUserDto contiene un email se busca para ver si existe, de existir se lanza una excepcion
        if (modifyUserDto.email) { await this.existEmail(modifyUserDto.email) }

        // Buscar el user por el id y setear los campos
        return await this.UserModel.updateOne({ _id: id }, { $set: updateFields })
    }

    private async existEmail(email: string) {
        // Buscar el email en la base de datos
        const user = await this.UserModel.findOne({ email: email });

        // Si el usuario fue eliminado terminar la ejecucion de la funcion
        if (user.deleted) {
            return;
        }

        // Si existe lanzar la excepcion
        if (user) {
            throw new RpcException( { status: HttpStatus.CONFLICT, message: `User with email ${email} already exist`} );
        }
    }

    

}
