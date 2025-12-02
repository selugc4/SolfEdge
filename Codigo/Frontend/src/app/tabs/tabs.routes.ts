import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'Ritmo',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Ritmo', ramaNombre: 'Ritmo' }
      },
      {
        path: 'Entonacion',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Entonación', ramaNombre: 'Entonación' }
      },
      {
        path: 'Audicion',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Lectura', ramaNombre: 'Audición' }
      },
      {
        path: 'Teoria',
        loadComponent: () => import('../pages/rama-detail/rama-detail.page').then(m => m.RamaDetailPage),
        data: { title: 'Teoría', ramaNombre: 'Teoria' }
      },
      {
        path: 'Perfil',
        loadComponent: () =>
          import('../tab5/tab5.page').then((m) => m.Tab5Page),
      },
      {
        path: 'Professor-admin',
        loadComponent: () =>
        import('../pages/professor-admin/professor-admin.page').then((m) => m.ProfessorAdminPage),
      },
      {
        path: 'Notificaciones',
        loadComponent: () => import('../pages/notificaciones/notificaciones.page').then( m => m.NotificacionesPage),
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: '/Areas/Ritmo',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/Areas/Ritmo',
    pathMatch: 'full',
  },
];
