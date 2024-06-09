import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: SchemaTypes.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiverId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: SchemaTypes.Date, default: () => new Date(), required: false })
  created_at: Date;

  @Prop({ type: SchemaTypes.Date, required: false })
  updated_at: Date;
}

export type MessageDocument = Message & Document;
export const MessageSchema = SchemaFactory.createForClass(Message);
