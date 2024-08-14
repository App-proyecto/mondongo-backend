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
        this.logger.log(`Registering interaction for user ${interactionDto.userId} with word ${interactionDto.word}`);
        // Obtener y remplazar el id de la palabra
        const wordData = await firstValueFrom( this.client.send('get_word_by_word', {word: interactionDto.word}) );
        if (!wordData) {
            this.logger.error(`Word ${interactionDto.word} not found`);
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
            this.logger.log(`Creating new interaction for user ${interactionDto.userId} with word ${interactionDto.word}`);
            return await this.UserInteractionModel.create(interactionRegister);
        }

        // Si ya existe, se actualiza
        if (interactionDto.successes) {
            interaction.successes += interactionDto.successes;
        }
        if (interactionDto.failures) {
            interaction.failures += interactionDto.failures;
        }
        this.logger.log(`Updating interaction for user ${interactionDto.userId} with word ${interactionDto.word}`);
        return await this.UserInteractionModel.updateOne({ userId: interactionDto.userId, wordId: interactionRegister.wordId }, { $set: interaction }).exec();
    }

    async getAllInteractionsByUserId(userId: string) {
        this.logger.log(`Getting all interactions for user ${userId}`);
        // Verificar si el id es un ObjectId válido
        if (!isValidObjectId(userId)) {
            this.logger.error(`Invalid user id ${userId}`);
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: `Invalid user id ${userId}` });
        }

        // Buscar todas las interacciones del usuario
        const interactions = await this.UserInteractionModel.find({ userId }).exec();

        // Si no hay interacciones
        if (!interactions) {
            this.logger.error(`Interactions for user with id ${userId} not found`);
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Interactions for user with id ${userId} not found` });
        }

        // Transformar los ids de las palabras a palabras
        for (const interaction of interactions) {
            const wordData = await firstValueFrom( this.client.send('get_word_by_id', {id: interaction.wordId}) );
            interaction.wordId = wordData.word;
        }

        this.logger.log(`Returning interactions for user ${userId}`);
        return interactions;
    }

    async createUser(createUserDto: CreateUserDto) {
        this.logger.log(`Creating user with email ${createUserDto.email}`);
        // Se verifica el email
        if (await this.existEmail(createUserDto.email)) {
            this.logger.error(`User with email ${createUserDto.email} already exists`);
            throw new RpcException({ status: HttpStatus.CONFLICT, message: `User with email ${createUserDto.email} already exists` });
        }

        // Encriptar la contraseña antes de hacer el registro en la bd
        createUserDto.password = await hash(createUserDto.password, 10);

        

        // Crear el usuario en la bd
        const user = await this.UserModel.create(createUserDto);
        this.logger.log(`User with email ${createUserDto.email} created`);
        return user; // Devolver el usuario creado
    }

    async getUserById(id: string) {
        this.logger.log(`Getting user with id ${id}`);
        // Verificar si el id es un ObjectId válido
        if (!isValidObjectId(id)) {
            this.logger.error(`Invalid user id ${id}`);
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: `Invalid user id ${id}` });
        }
        const user = await this.UserModel.findById(id);
        if (!user) {
            this.logger.error(`User with id ${id} not found`);
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `User with id ${id} not found` });
        }
        if (user.deleted) {
            this.logger.error(`User with id ${id} is soft deleted`);
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `User with id ${id} is soft deleted` });
        }
        this.logger.log(`Returning user with id ${id}`);
        return user;
    }

    async deleteUser(id: string) {
        this.logger.log(`Deleting user with id ${id}`);
        // Se busca el usuario, si no existe se lanzaran las excepciones de la funcion
        await this.getUserById(id);

        // Buscar el usuario donde el id coincida y cambiar el campo deleted a true
        const deletedUser = await this.UserModel.updateOne({ _id: id }, { $set: { deleted: true } });
        this.logger.log(`User with id ${id} deleted`);
        return deletedUser
    }

    async modifyUser(modifyUserDto: ModifyUserDto) {
        this.logger.log(`Modifying user with id ${modifyUserDto.id}`);
        // Separar el id de los datos a actualizar
        const { id, ...updateFields } = modifyUserDto;

        // Se busca el usuario, si no existe se lanzarán las excepciones de la función
        await this.getUserById(id);

        // Si el modifyUserDto contiene un email se busca para ver si existe, de existir se lanza una excepción
        if (updateFields.email && await this.existEmail(updateFields.email)) {
            this.logger.error(`Ya existe un usuario con el correo ${updateFields.email}`);
            throw new RpcException({ status: HttpStatus.CONFLICT, message: `Ya existe un usuario con el correo ${updateFields.email}` });
        }

        // Si se modificará la password se encripta
        if (updateFields.password) {
            this.logger.log(`Encriptando la contraseña del usuario con id ${id}`);
            updateFields.password = await hash(updateFields.password, 10);
        }

        // Buscar el usuario por el id y setear los campos
        this.logger.log(`Modifying user in database with id ${id}`);
        return await this.UserModel.updateOne({ _id: id }, { $set: updateFields }).exec(); // Asegurarse de usar exec() para obtener una promesa
    }

    async loginUser(loginUserDto: LoginUserDto) {
        this.logger.log(`Login user with email ${loginUserDto.email}`);
        const user = await this.UserModel.findOne({ email: loginUserDto.email });

        // Si no se encuentra el usuario
        if (!user) {
            this.logger.error(`User with email ${loginUserDto.email} not found`);
            throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `User with email ${loginUserDto.email} not found` });
        }

        // Verificar la contraseña
        if (!await compare(loginUserDto.password, user.password)) {
            this.logger.error(`Incorrect password for user with email ${loginUserDto.email}`);
            throw new RpcException({ status: HttpStatus.FORBIDDEN, message: `Incorrect password` });
        }

        this.logger.log(`User with email ${loginUserDto.email} logged in`);
        return {
            id: user._id,
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
