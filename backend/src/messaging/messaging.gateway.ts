// import {
//   WebSocketGateway,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { MessagingService } from './messaging.service';
// import { UseGuards } from '@nestjs/common';
// // TODO: Fix import path after finding the correct location of the websocket auth guard
// // import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
// import { SendMessageDto, MarkMessagesReadDto } from './dto/messaging.dto';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
//   namespace: 'messaging',
// })
// export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
 
// } 