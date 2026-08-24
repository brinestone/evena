import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { useDatabase } from '../db';
import * as schema from '../db/auth/auth-schema';
import { useRuntimeConfig } from 'nitro/runtime-config';

const config = useRuntimeConfig();
export const auth = betterAuth({
  database: drizzleAdapter(useDatabase(), { provider: 'pg', schema }),
  baseURL: config['baseUrl'] as string,
  // basePath: '/api',
  socialProviders: {
    google: {
      clientId: config['googleClientSecret'],
      clientSecret: config['googleClientSecret'] as string,
    },
  },
});
