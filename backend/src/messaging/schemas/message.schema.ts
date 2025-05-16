// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import mongoose, { Document } from 'mongoose';
// import { User } from '../../users/schemas/user.schema';
// import { Conversation } from './conversation.schema';

// export type MessageDocument = Message & Document;

// export class MessageAttachment {
//   @Prop({ required: true })
//   url: string;

//   @Prop({ required: true })
//   type: string; // 'image', 'document', etc.

//   @Prop({ required: false })
//   name?: string;

//   @Prop({ required: false })
//   size?: number;
// }

// @Schema({
//   timestamps: true,
//   toJSON: {
//     virtuals: true,
//     transform: (_doc, ret) => {
//       delete ret.__v;
//       return ret;
//     },
//   },
// })
// export class Message {
//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
//   senderId: User;

//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true })
//   conversationId: Conversation;

//   @Prop({ required: true })
//   content: string;

//   @Prop({ type: [{ type: Object }], default: [] })
//   attachments: MessageAttachment[];

//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null })
//   replyToId: Message;

//   @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
//   readBy: User[];

//   @Prop({ default: false })
//   isDeleted: boolean;
// }

// export const MessageSchema = SchemaFactory.createForClass(Message); 