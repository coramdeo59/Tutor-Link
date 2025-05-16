

// import { User } from '../../users/schemas/user.schema';

// export type ConversationDocument = Conversation & Document;

// export class ConversationParticipant {
//   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
//   userId: User;

//   @Prop({ default: false })
//   isAdmin: boolean;

//   @Prop({ default: Date.now })
//   joinedAt: Date;

//   @Prop({ default: null })
//   lastReadAt: Date;
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
// export class Conversation {
//   @Prop({ required: false })
//   title: string;

//   @Prop({ default: false })
//   isGroupChat: boolean;

//   @Prop({ type: [{ type: Object }], required: true })
//   participants: ConversationParticipant[];

//   @Prop({ default: null })
//   lastMessageAt: Date;

//   @Prop({ default: false })
//   isDeleted: boolean;
// }

// export const ConversationSchema = SchemaFactory.createForClass(Conversation);

// // Add virtual field for lastMessage
// ConversationSchema.virtual('lastMessage', {
//   ref: 'Message',
//   localField: '_id',
//   foreignField: 'conversationId',
//   justOne: true,
//   options: { sort: { createdAt: -1 } },
// }); 