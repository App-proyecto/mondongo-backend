import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose'; // Asegúrate de importar isValidObjectId
import { CreateUserDto, LoginUserDto } from 'apps/common/users';
import { User } from '../schemas/user.schema';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ModifyUserDto } from 'apps/common/users/modify-user.dto';
import { hash, compare } from 'bcrypt';
import { RecoveryEmailDto } from 'apps/common/mails/recovery-email.dto';
import { EmailSender } from 'apps/common/mails/send-mails';
import { NATS_SERVICE } from 'apps/config';
import { UserInteraction } from '../schemas/user-interactions.schema';
import { InteractionDto } from 'apps/common/users/register-interaction.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        @InjectModel(User.name) private UserModel: Model<User>,
        @InjectModel(UserInteraction.name) private UserInteractionModel: Model<UserInteraction>,
        @Inject(NATS_SERVICE) private readonly client: ClientProxy,
        private emailSender: EmailSender
    ) {}

    async registerInteraction(interactionDto: InteractionDto) {
        // Obtener y remplazar el id de la palabra
        const wordData = await firstValueFrom( this.client.send('get_word_by_word', {word: interactionDto.word}) );
        if (!wordData) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Word ${interactionDto.word} not found` });
        }

        // Crear el registro de la interacción
        const interactionRegister = {
            userId: interactionDto.userId,
            wordId: wordData._id,
            successes: interactionDto.successes,
            failures: interactionDto.failures
        };

        // Verificar si ya existe una interacción, si no existe se crea
        const interaction = await this.UserInteractionModel.findOne({ userId: interactionDto.userId, wordId: interactionRegister.wordId });
        if (!interaction) {
            return await this.UserInteractionModel.create(interactionRegister);
        }

        // Si ya existe, se actualiza
        if (interactionDto.successes) {
            interaction.successes += interactionDto.successes;
        }
        if (interactionDto.failures) {
            interaction.failures += interactionDto.failures;
        }
        return await this.UserInteractionModel.updateOne({ userId: interactionDto.userId, wordId: interactionRegister.wordId }, { $set: interaction }).exec();
    }

    async getAllInteractionsByUserId(userId: string) {
        // Verificar si el id es un ObjectId válido
        if (!isValidObjectId(userId)) {
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: `Invalid user id ${userId}` });
        }

        // Buscar todas las interacciones del usuario
        const interactions = await this.UserInteractionModel.find({ userId }).exec();

        // Si no hay interacciones
        if (!interactions) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Interactions for user with id ${userId} not found` });
        }

        // Transformar los ids de las palabras a palabras
        for (const interaction of interactions) {
            const wordData = await firstValueFrom( this.client.send('get_word_by_id', {id: interaction.wordId}) );
            interaction.wordId = wordData.word;
        }

        return interactions;
    }

    async createUser(createUserDto: CreateUserDto) {
        // Se verifica el email
        if (await this.existEmail(createUserDto.email)) {
            throw new RpcException({ status: HttpStatus.CONFLICT, message: `User with email ${createUserDto.email} already exists` });
        }

        // Encriptar la contraseña antes de hacer el registro en la bd
        createUserDto.password = await hash(createUserDto.password, 10);

        // Crear el usuario en la bd
        const user = await this.UserModel.create(createUserDto);
        return user; // Devolver el usuario creado
    }

    async getUserById(id: string) {
        // Verificar si el id es un ObjectId válido
        if (!isValidObjectId(id)) {
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: `Invalid user id ${id}` });
        }

        const user = await this.UserModel.findById(id);
        if (!user) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `User with id ${id} not found` });
        }
        if (user.deleted) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `User with id ${id} is soft deleted` });
        }
        return user;
    }

    async deleteUser(id: string) {
        // Se busca el usuario, si no existe se lanzaran las excepciones de la funcion
        await this.getUserById(id);

        // Buscar el usuario donde el id coincida y cambiar el campo deleted a true
        return await this.UserModel.updateOne({ _id: id }, { $set: { deleted: true } });
    }

    async modifyUser(modifyUserDto: ModifyUserDto) {
        // Separar el id de los datos a actualizar
        const { id, ...updateFields } = modifyUserDto;

        // Se busca el usuario, si no existe se lanzarán las excepciones de la función
        await this.getUserById(id);

        // Si el modifyUserDto contiene un email se busca para ver si existe, de existir se lanza una excepción
        if (updateFields.email && await this.existEmail(updateFields.email)) {
            throw new RpcException({ status: HttpStatus.CONFLICT, message: `Ya existe un usuario con el correo ${updateFields.email}` });
        }

        // Si se modificará la password se encripta
        if (updateFields.password) {
            updateFields.password = await hash(updateFields.password, 10);
        }

        // Buscar el usuario por el id y setear los campos
        return await this.UserModel.updateOne({ _id: id }, { $set: updateFields }).exec(); // Asegurarse de usar exec() para obtener una promesa
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const user = await this.UserModel.findOne({ email: loginUserDto.email });

        // Si no se encuentra el usuario
        if (!user) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `User with email ${loginUserDto.email} not found` });
        }

        // Verificar la contraseña
        if (!await compare(loginUserDto.password, user.password)) {
            throw new RpcException({ status: HttpStatus.FORBIDDEN, message: `Incorrect password` });
        }

        return {
            name: user.username,
            email: user.email
        };
    }

    async sendRecoveryCode(recoveryEmailDto: RecoveryEmailDto) {
        // Verificar existencia del email
        if (!await this.existEmail(recoveryEmailDto.email)) {
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `No existe un usuario con el correo ${recoveryEmailDto.email}` });
        }

        // Intentar enviar el código
        return this.emailSender.sendRecoveryEmail(recoveryEmailDto.email);
    }

    private async existEmail(email: string) {
        // Buscar el email en la base de datos
        const user = await this.UserModel.findOne({ email }).exec(); // Asegúrate de usar exec() para obtener una promesa

        // Si no existe o fue eliminado
        return user && !user.deleted;
    }
}
