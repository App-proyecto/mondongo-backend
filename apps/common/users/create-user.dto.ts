import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    
    @IsString()
    username: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(16)
    password: string;

}