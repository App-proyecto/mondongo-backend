import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { envs } from 'apps/config';
import * as nodemailer from 'nodemailer';

export class EmailSender {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: envs.email,
                pass: envs.emailPassword,
            }
        });
    }

    async sendRecoveryEmail(email: string) {
        try {
            const recoveryCode = Math.random().toString(36).toUpperCase().substring(2, 8); // Codigo de recuperacion 
            await this.transporter.sendMail({
                from: envs.email,
                to: email,
                subject: "Código de recuperación",
                text: recoveryCode, 
            });
            return recoveryCode;
        } catch (error) {
            console.log(error)
            throw new RpcException( { status:HttpStatus.INTERNAL_SERVER_ERROR, message:"Ocurrio un error al enviar el codigo de recuperación" } );
        }
    }
}
