import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { admin } from '../users/admin/schema/admin.schema';
import { tutors } from '../users/tutors/schema/tutor.schema';
import { parents } from '../users/parent/schema/parent.schema';
import { refreshTokens } from '../auth/authentication/refresh-token-ids.storage/schema/refresh-tokens.schema';
import { passwordResetTokens } from '../auth/authentication/schema/password-reset-tokens.schema';
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
            admin,
            tutors,
            parents,
            refreshTokens,
            passwordResetTokens,
            children: require('../users/parent/schema/parent.schema').children,
            tutorSubjects: require('../users/tutors/schema/tutor.schema').tutorSubjects,
            tutorGrades: require('../users/tutors/schema/tutor.schema').tutorGrades,
            tutorAvailability: require('../users/tutors/schema/tutor.schema').tutorAvailability,
            tutorVerifications: require('../users/tutors/schema/tutor.schema').tutorVerifications,
            // Sessions are now handled in the tutors module
            tutoringSessions: require('../users/tutors/sessions/schema/sessions.schema').tutoringSessions,
          },
        });
      },
      inject: [ConfigService, databaseConfig.KEY],
    },
    {
      provide: 'drizzle',
      useExisting: DATABASE_CONNECTION,
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class CoreModule {}
