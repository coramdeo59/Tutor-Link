import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from './database-connection';
import { Pool } from 'pg';
import * as userSchema from '../users/schema';
import { DrizzleService } from './drizzle.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          connectionString: configService.getOrThrow('DATABASE_URL'),
        });
        return drizzle(pool, {
          schema: {
            ...userSchema,
          },
        });
      },
      inject: [ConfigService],
    },
    DrizzleService,
  ],
  exports: [DATABASE_CONNECTION, DrizzleService],
})
export class DatabaseModule {}
