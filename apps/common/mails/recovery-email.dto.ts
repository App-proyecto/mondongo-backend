import { IsEmail, IsString } from "class-validator";

export class RecoveryEmailDto {
    @IsString()
    @IsEmail()
    email: string;
}   
    