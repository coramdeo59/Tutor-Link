import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as userSchema from '../users/schema/User-schema';
import * as addressSchema from '../users/schema/Address-schema';
import { DrizzleService } from './drizzle.service';
import { DATABASE_CONNECTION } from './database-connection';
import databaseConfig from '../config/databse-config';

@Global()
@Module({
  imports: [ConfigModule.forFeature(databaseConfig)],
  providers: [
    {
      provide: DATABASE_CONNECTION,

      useFactory: async (
        configService: ConfigService,
        dbConfig: ReturnType<typeof databaseConfig>,
      ) => {
        let pool: Pool;

        if (
          dbConfig.host &&
          dbConfig.port &&
          dbConfig.user &&
          dbConfig.password &&
          dbConfig.dbName
        ) {
          pool = new Pool({
            host: dbConfig.host,
            port: dbConfig.port,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.dbName,
          });
        } else {
          const connectionString =
            dbConfig.url ?? configService.getOrThrow('DATABASE_URL');
          pool = new Pool({
            connectionString: connectionString,
          });
        }

        return drizzle(pool, {
          schema: {
            ...userSchema,
            ...addressSchema,
            // ...tutorSchema, // Schemas themselves
          },
        });
      },
      inject: [ConfigService, databaseConfig.KEY],
    },
    {
      provide: 'drizzle',
      useExisting: DATABASE_CONNECTION,
    },
    DrizzleService,
  ],
  exports: [DATABASE_CONNECTION, 'drizzle', DrizzleService],
})
export class CoreModule {}
