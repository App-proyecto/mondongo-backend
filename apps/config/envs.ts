
import 'dotenv/config';
import * as joi from 'joi';

// Interfaz de variables de entorno
interface envVars {
    PORT_CLIENT_GATEWAY: number;
    NATS_SERVERS: string;
    DATABASE_URL: string;
    DEEPL_API_KEY: string;

    EMAIL: string;
    EMAIL_PASSWORD: string;
}

// Esquema de validación de variables de entorno
const envsSchema = joi.object({
    PORT_CLIENT_GATEWAY: joi.number().required(),
    NATS_SERVERS: joi.string().required(),
    DATABASE_URL: joi.string().required(),
    DEEPL_API_KEY: joi.string().required(),

    EMAIL: joi.string().required(),
    EMAIL_PASSWORD: joi.string().required()
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
    databaseUrl: envVars.DATABASE_URL,
    deeplApiKey: envVars.DEEPL_API_KEY,

    email: envVars.EMAIL,
    emailPassword: envVars.EMAIL_PASSWORD,

}