import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {

  @Prop({ type: Types.ObjectId, ref: 'Utilisateur', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Utilisateur', required: true })
  receiverId: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 'text' })
  type: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ type: Date, default: null })
  readAt: Date | null;

  // 👇👇 AJOUT OBLIGATOIRE pour enlever l’erreur
  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
