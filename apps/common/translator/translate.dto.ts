import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class TranslateDto {

    @IsString()
    @MaxLength(100)
    text: string;

    @IsString()
    @IsIn(['ES', 'EN'], { message: `TargetLang debe de ser uno de los siguientes valores ES, EN` })
    targetLang: string;

    @IsOptional()
    @IsString()
    @IsIn(['ES', 'EN'], { message: `SourceLang debe de ser uno de los siguientes valores ES, EN` })
    sourceLang?: string = 'EN';  

}