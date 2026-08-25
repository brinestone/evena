import { defineConfig } from 'orval';
export default defineConfig({
  evena: {
    output: {
      mode: 'tags-split',
      clean: true,
      client: 'angular',
      target: 'src/app/sdk/evena',
      indexFiles: true,
      namingConvention: 'kebab-case',
      override: {
        angular: {
          provideIn: false,
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
