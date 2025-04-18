import 'dotenv/config'; // Load environment variables
import { defineConfig } from 'drizzle-kit';

// Check if individual database parameters are available
const dbHost = process.env.POSTGRES_HOST;
const dbPort = process.env.POSTGRES_PORT;
const dbUser = process.env.POSTGRES_USER;
const dbPassword = process.env.POSTGRES_PASSWORD;
const dbName = process.env.POSTGRES_DB;

// Construct a connection URL if individual parameters are available
let connectionUrl: string;
if (dbHost && dbPort && dbUser && dbPassword && dbName) {
  connectionUrl = `postgres://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
} else {
  connectionUrl = process.env.DATABASE_URL || '';
}

if (!connectionUrl) {
  throw new Error('Database connection information is required. Either provide DATABASE_URL or all individual POSTGRES_* variables');
}

export default defineConfig({
  schema: './src/**/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionUrl,
  },
});
