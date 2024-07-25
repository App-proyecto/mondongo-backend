import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs } from 'apps/config';
import { NATS_SERVICE } from 'apps/config/services';
;

@Module({

    imports: [
        ClientsModule.register([
            {
                name: NATS_SERVICE,
                transport: Transport.NATS,
                options: {
                    servers: envs.natsServer,
                },
            },
        ]),
    ],
    exports: [
        ClientsModule.register([
            {
                name: NATS_SERVICE,
                transport: Transport.NATS,
                options: {
                    servers: envs.natsServer,
                },
            },
        ]),
    ],

})
export class NatsModule { }
