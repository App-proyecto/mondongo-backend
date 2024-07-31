import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { firstValueFrom, map } from 'rxjs';

@Injectable()
export class WordsService {
    constructor( private httpService: HttpService ) {}

    async getRelatedWords(term: String) {
        
        // Hacer la peticion a la api
        const url = `https://api.datamuse.com/words?rel_trg=${term}`;
        const words = await firstValueFrom( this.httpService.get(url).pipe(map(response => response.data)) );
        
        // Comprobar si `words` tiene datos
        if (!words || words.length === 0) {
            throw new RpcException({ 
            status: HttpStatus.NOT_FOUND, 
            message: `No se encontraron palabras relacionadas con "${term}".` 
            });
        }

        return words;
    }
}
