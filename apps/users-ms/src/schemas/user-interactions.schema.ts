import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserInteraction extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    wordId: string;

    @Prop({ required: true })
    successes: number;

    @Prop({ required: true })
    failures: number;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);
