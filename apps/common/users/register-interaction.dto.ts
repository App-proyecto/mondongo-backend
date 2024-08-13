import { IsNumber, IsOptional, IsString } from "class-validator";

export class InteractionDto {
    @IsString()
    userId: string;
    @IsString()
    word: string;
    @IsNumber()
    @IsOptional()
    successes?: number = 0;
    @IsNumber()
    @IsOptional()
    failures?: number = 0;
}