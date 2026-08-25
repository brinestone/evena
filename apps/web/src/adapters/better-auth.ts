import {
  assertInInjectionContext,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
} from '@angular/core';
import { createAuthClient } from 'better-auth/client';
import { environment } from '../environments/environment';

export const BETTER_AUTH = new InjectionToken<ReturnType<typeof createAuthClient>>('better-auth');
export function provideBetterAuth() {
  return makeEnvironmentProviders([
    {
      provide: BETTER_AUTH,
      useFactory: () => createAuthClient({ baseURL: environment.apiUrlBase, basePath: '/api' }),
      multi: false,
    },
  ]);
}
export function injectBetterAuth() {
  assertInInjectionContext(injectBetterAuth);
  return inject(BETTER_AUTH);
}
