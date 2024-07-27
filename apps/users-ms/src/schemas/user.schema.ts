import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// Definición del tipo de documento
export type UserDocument = HydratedDocument<User>;

// Definición del esquema
@Schema({ timestamps: true }) // Esta opción añade automáticamente `createdAt` y `updatedAt`
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: false })
  deleted: boolean;


  // Los campos `createdAt` y `updatedAt` se manejan automáticamente
}

// Creación del esquema
export const UserSchema = SchemaFactory.createForClass(User);
