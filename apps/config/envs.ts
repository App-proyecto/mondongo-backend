
import 'dotenv/config';
import * as joi from 'joi';

// Interfaz de variables de entorno
interface envVars {
    PORT_CLIENT_GATEWAY: number;
    NATS_SERVERS: string;
    USER_DATABASE_URL: string;
    FOOD_DATABASE_URL: string;
}

// Esquema de validación de variables de entorno
const envsSchema = joi.object({
    PORT_CLIENT_GATEWAY: joi.number().required(),
    NATS_SERVERS: joi.string().required(),
    USER_DATABASE_URL: joi.string().required(),
    FOOD_DATABASE_URL: joi.string().required(),
}).unknown(true);

// Validación de variables de entorno
const {error, value} = envsSchema.validate( process.env );

// Si hay un error en la validación, se lanza una excepción
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

// Se asignan las variables de entorno validadas a una constante
const envVars: envVars = value;

// Se exportan las variables de entorno
export const envs = {
    portClientGateway: envVars.PORT_CLIENT_GATEWAY,
    natsServer: envVars.NATS_SERVERS,
    userDatabaseUrl: envVars.USER_DATABASE_URL,
    foodDatabaseUrl: envVars.FOOD_DATABASE_URL,
}