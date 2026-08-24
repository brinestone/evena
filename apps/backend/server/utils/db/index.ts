import { drizzle } from 'drizzle-orm/node-postgres';
import { useRuntimeConfig } from 'nitro/runtime-config';
import { Pool } from 'pg';
export * from './relations';
export * from './schema';
let pool: Pool;
export async function initializeDbPool() {
  console.log('Initializing database connection pool');
  const url = new URL(useRuntimeConfig()['databaseUrl'] as string);
  if (pool) return;
  const dbCredentials = {
    database: url.pathname.substring(1),
    host: url.hostname,
    password: url.password,
    user: url.username,
    port: Number(url.port),
    ssl: url.searchParams.has('sslmode', 'require'),
  };
  pool = new Pool({
    ...dbCredentials,
  });
  const client = await pool.connect();
  client.release();
  console.log('pool initialized successfully');
}

export function useDatabase() {
  return drizzle({ client: pool });
}
