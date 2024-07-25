import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreateUserDto {
    @IsString()
    name: string;

    @IsNumber()
    @IsPositive()
    age: number;
}