// import { Module } from '@nestjs/common';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { MessagingService } from './messaging.service';
// import { MessagingController } from './messaging.controller';
// import { MessagingGateway } from './messaging.gateway';
// import { CoreModule } from '../core/core.module';

// @Module({
//   imports: [
//     CoreModule,
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         secret: configService.get<string>('JWT_SECRET'),
//         signOptions: {
//           expiresIn: configService.get<string>('JWT_EXPIRATION', '1d'),
//         },
//       }),
//     }),
//   ],
//   controllers: [MessagingController],
//   providers: [MessagingService, MessagingGateway],
//   exports: [MessagingService],
// })
// export class MessagingModule {} 