import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    
    @IsString()
    username: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(4)
    @MaxLength(12)
    password: string;

}