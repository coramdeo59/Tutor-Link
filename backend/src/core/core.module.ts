import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as userSchema from '../users/schema';
import * as addressSchema from '../users/address/schema';
import * as studentSchema from '../users/students/schema';
// import * as tutorSchema from '../users/tutors/schema';
import { DrizzleService } from './drizzle.service';
import { DATABASE_CONNECTION } from './database-connection';
import databaseConfig from '../config/databse-config';
import { allRelations } from './relations'; // Import the centralized relations

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
            ...studentSchema,
            // ...tutorSchema, // Schemas themselves
            ...allRelations, // All relations combined
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
