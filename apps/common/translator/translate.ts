import { Injectable, HttpStatus } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { TranslateDto } from './translate.dto';
import { envs } from 'apps/config'; // Ajusta la ruta según tu estructura
import { RpcException } from '@nestjs/microservices';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DeeplService {
    private readonly deeplUrl = 'https://api-free.deepl.com/v2/translate';
    private readonly apiKey: string;
    private readonly httpService: HttpService;

    constructor() {
        this.apiKey = envs.deeplApiKey;
        this.httpService = new HttpService(); // Inicializa HttpService aquí
    }

    async translateText(translateDto: TranslateDto): Promise<string> {
        try {
            const response: AxiosResponse = await firstValueFrom(
                this.httpService.post(this.deeplUrl, null, {
                    params: {
                        auth_key: this.apiKey,
                        text: translateDto.text,
                        target_lang: translateDto.targetLang,
                        source_lang: translateDto.sourceLang
                    },
                })
            );

            if (response.data && response.data.translations) {
                return response.data.translations[0].text;
            } else {
                throw new Error('Error al traducir el texto');
            }
        } catch (error) {
            console.error('Error al conectar con la API de DeepL:', error);
            throw new RpcException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error al conectar con la API de DeepL',
            });
        }
    }
}
