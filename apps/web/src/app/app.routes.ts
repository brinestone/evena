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
    path: 'about',
    loadComponent: () => import('./pages/about/about.page').then((m) => m.AboutPage),
    title: 'About',
  },
  {
    path: '',
    redirectTo: 'events',
    pathMatch: 'full',
  },
];
