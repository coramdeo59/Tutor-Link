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
        // Check if individual DB parameters are available
        const host = configService.get('POSTGRES_HOST');
        const port = configService.get('POSTGRES_PORT');
        const user = configService.get('POSTGRES_USER');
        const password = configService.get('POSTGRES_PASSWORD');
        const database = configService.get('POSTGRES_DB');

        let pool: Pool;
        
        // If all individual parameters are present, use them
        if (host && port && user && password && database) {
          pool = new Pool({
            host,
            port: parseInt(port, 10),
            user,
            password,
            database,
          });
        } else {
          // Fall back to DATABASE_URL
          pool = new Pool({
            connectionString: configService.getOrThrow('DATABASE_URL'),
          });
        }

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
