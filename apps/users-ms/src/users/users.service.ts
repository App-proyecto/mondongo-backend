import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto, LoginUserDto } from 'apps/common/users';
import { Model } from 'mongoose';
import { User } from '../schemas/user.schema';
import { RpcException } from '@nestjs/microservices';
import { ModifyUserDto } from 'apps/common/users/modify-user.dto';
import { hash, compare } from 'bcrypt'
import { RecoveryEmailDto } from 'apps/common/mails/recovery-email.dto';
import { EmailSender } from 'apps/common/mails/send-mails';

@Injectable()
export class UsersService {

    constructor( 
        @InjectModel(User.name) private UserModel: Model<User>,
        private emailSender: EmailSender
    ) {}
    
    async createUser(createUserDto: CreateUserDto) {
        // Se verifica el email
        if (await this.existEmail(createUserDto.email)) { 
            // Si se encontro el email
            throw new RpcException( { status: HttpStatus.CONFLICT, message: `User with email ${createUserDto.email} already exist` } )
        }

        // Encriptar la contraseña antes de hacer el registro en la bd
        createUserDto.password = await hash(createUserDto.password, 10);

        // Crear el usuario en la bd
        const user = await this.UserModel.create(createUserDto)

        return ;
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
        if (updateFields.email && this.existEmail(updateFields.email)) { 
            // Si se encontro el email
            throw new RpcException( { status: HttpStatus.CONFLICT, message: `Ya existe un usuario con el correo ${updateFields.email}` } )
        }

        // Si se modificara la password se encripta
        if (updateFields.password) {
            updateFields.password = await hash(updateFields.password, 10);
        }
    
        // Buscar el user por el id y setear los campos
        return await this.UserModel.updateOne({ _id: id }, { $set: updateFields })
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const user = await this.UserModel.findOne({ email: loginUserDto.email })

        // Si no se encuentra el user
        if (!user) { 
            throw new RpcException( { status: HttpStatus.NOT_FOUND, message: `User with email ${loginUserDto.email} not found` } );
        }

        // Verificar la contraseña
        if(!await compare(loginUserDto.password, user.password)) {
            throw new RpcException( { status: HttpStatus.FORBIDDEN, message: `Incorrect password` } )
        }

        return {
            name: user.username,
            email: user.email
        };
    }

    async sendRecoveryCode(recoveryEmailDto: RecoveryEmailDto) {
        // Si no existe el user en la base de datos
        if (!this.existEmail) {
            throw new RpcException( { status: HttpStatus.NOT_FOUND, message: `No existe un usuario con el correo ${recoveryEmailDto.email}` } );
        }

        // Intentar enviar el codigo
        return this.emailSender.sendRecoveryEmail(recoveryEmailDto.email);
    }

    private async existEmail(email: string) {
        // Buscar el email en la base de datos
        const user = await this.UserModel.findOne({ email: email });

        // Si no existe
        if (!user) {
            return false;
        }

        // Si el usuario fue eliminado
        if (user.deleted) {
            return false;
        }

        return true;
    }

}


