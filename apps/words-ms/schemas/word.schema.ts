import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Word extends Document {
    @Prop({ required: true, unique: true, maxlength: 100, minlength: 1 })
    word: string;
}

export const WordSchema = SchemaFactory.createForClass(Word);
