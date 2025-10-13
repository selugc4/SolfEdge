import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'ritmo',
        loadComponent: () =>
          import('../ritmo/ritmo.page').then((m) => m.RitmoPage),
      },
      {
        path: 'entonacion',
        loadComponent: () =>
          import('../entonacion/entonacion.page').then((m) => m.EntonacionPage),
      },
      {
        path: 'audicion',
        loadComponent: () =>
          import('../audicion/audicion.page').then((m) => m.AudicionPage),
      },
      {
        path: 'teoria',
        loadComponent: () =>
          import('../teoria/teoria.page').then((m) => m.TeoriaPage),
      },
      {
        path: '',
        redirectTo: '/tabs/ritmo',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/ritmo',
    pathMatch: 'full',
  },
];
