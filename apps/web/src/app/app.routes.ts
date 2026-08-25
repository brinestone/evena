import { Routes } from '@angular/router';
import { provideEventsSdk } from '../adapters/sdk';

export const routes: Routes = [
  {
    path: 'events',
    providers: [provideEventsSdk()],
    loadComponent: () => import('./pages/events/events').then((m) => m.Events),
    title: 'Happening now',
  },
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
];
