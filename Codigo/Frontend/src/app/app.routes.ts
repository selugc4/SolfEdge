import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { LoginGuard } from './guards/login.guard';
import { WelcomeGuard } from './guards/welcome.guard';
import { AdminContentComponent } from './pages/admin/admin-content.component';

export const routes: Routes = [
  {
    path: 'welcome',
    loadComponent: () => import('./pages/welcome/welcome.page').then( m => m.WelcomePage),
    canActivate: [WelcomeGuard]
  },
  {
    path: 'Login',
    loadComponent: () => import('./auth/login/login.page').then( m => m.LoginPage),
    canActivate: [LoginGuard]
  },
  {
    path: 'Areas',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
    canActivate: [AuthGuard]
  },
  {
    path: 'Admin',
    component: AdminContentComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'Tarea-detalle/:id',
    loadComponent: () => import('./pages/tarea-detalle/tarea-detalle.page').then( m => m.TareaDetallePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'Cuestionario-edit/:id',
    loadComponent: () => import('./pages/cuestionario-edit/cuestionario-edit.page').then( m => m.CuestionarioEditPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'Cuestionario-edit',
    loadComponent: () => import('./pages/cuestionario-edit/cuestionario-edit.page').then( m => m.CuestionarioEditPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'Cuestionario-completar/:id',
    loadComponent: () => import('./pages/cuestionario-completar/cuestionario-completar.page').then( m => m.CuestionarioCompletarPage),
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'Login',
    pathMatch: 'full'
  }
];
