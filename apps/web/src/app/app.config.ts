import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { provideBetterAuth } from '../adapters/better-auth';
import { routes } from './app.routes';
import { apiUrlInterceptor } from './interceptors/api-url-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(
      withHttpTransferCacheOptions({
        includePostRequests: false,
        includeRequestsWithCredentials: true,
      }),
    ),
    provideBetterAuth(),
    provideHttpClient(withInterceptors([apiUrlInterceptor])),
  ],
};
