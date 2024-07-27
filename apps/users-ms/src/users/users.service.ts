import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from 'apps/common/users';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { filter } from 'rxjs';


@Injectable()
export class UsersService {
    constructor( @InjectModel(User.name) private UserModel: Model<User>) {}

    async createUser(createUserDto: CreateUserDto) {

        // Se busca el usuaro mediante el email, de encontrarse se lanza una excepcion
        const exist = await this.UserModel.findOne({ email: createUserDto.email });
        if (exist) {
            throw new RpcException( { status: HttpStatus.CONFLICT, message: `User with email ${createUserDto.email} already exist`} );
        }
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

    

}
