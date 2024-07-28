import { PartialType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import { IsString } from "class-validator";

export class ModifyUserDto extends PartialType(CreateUserDto) {
    @IsString()
    id: string;
}