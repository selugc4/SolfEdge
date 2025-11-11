import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'tab1',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Ritmo', ramaNombre: 'Ritmo' }
      },
      {
        path: 'tab2',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Entonación', ramaNombre: 'Entonación' }
      },
      {
        path: 'tab3',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Lectura', ramaNombre: 'Audición' }
      },
      {
        path: 'tab4',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Teoría', ramaNombre: 'Teoría' }
      },
      {
        path: 'tab5',
        loadComponent: () =>
          import('../tab5/tab5.page').then((m) => m.Tab5Page),
      },
      {
        path: 'professor-admin',
        loadComponent: () =>
          import('../pages/professor-admin/professor-admin.page').then((m) => m.ProfessorAdminPage),
      },
      {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/tab1',
    pathMatch: 'full',
  },
];
