import { defineConfig } from 'nitro';

export default defineConfig({
  serverDir: './server',
  compatibilityDate: '2026-08-24',
  preset: 'netlify',
  apiBaseURL: '/api',
  logLevel: 3,
  devServer: {
    watch: ['.env', './assets/drizzle'],
  },
  serverAssets: [{ baseName: 'migrations', dir: './assets/drizzle' }],
  runtimeConfig: {
    databaseUrl: '',
    betterAuthSecret: '',
    googleClientSecret: '',
    googleClientId: '',
    baseUrl: 'https://smattend.netlify.app',
  },
  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS,PATCH,DELETE,PUT',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Origin': '*',
      },
    },
  },
  experimental: {
    openAPI: true,
    envExpansion: true,
    tasks: true,
  },
  openAPI: {
    meta: {
      title: 'Evena API',
      version: '1.0',
    },
    route: '/_docs/openapi.json',
    ui: {
      swagger: false,
      scalar: {
        route: '/_docs/scalar',
      },
    },
  },
});
