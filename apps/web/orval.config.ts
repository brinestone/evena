import { defineConfig } from 'orval';
export default defineConfig({
  evena: {
    output: {
      mode: 'tags-split',
      clean: true,
      client: 'angular',
      target: './libs/sdk/evena/api',
      indexFiles: true,
      namingConvention: 'kebab-case',
      override: {
        enumGenerationType: 'union',
        angular: {
          provideIn: false,
          retrievalClient: 'both',
        },
      },
      schemas: {
        path: './libs/sdk/evena/models',
      },
      operationSchemas: './libs/sdk/evena/payloads',
    },
    input: {
      filters: {
        mode: 'include',
        tags: ['Events'],
      },
      target: 'http://localhost:3000/_docs/openapi.json',
    },
  },
});
