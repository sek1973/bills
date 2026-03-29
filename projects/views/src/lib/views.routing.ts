import { Routes, mapToCanActivate } from '@angular/router';
import { AuthGuard } from 'projects/tools/src/public-api';
import { BillComponent, ChangePasswordComponent, LoginComponent, OverviewComponent, PageNotFoundComponent, ResetPasswordComponent, UpdatePasswordComponent } from './components';
import { RootComponent } from './components/root/root.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: RootComponent,
    children: [
      {
        path: 'zestawienie',
        component: OverviewComponent,
        canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'rachunek',
        component: BillComponent,
        pathMatch: 'full',
        data: { title: 'Nowy rachunek' },
        canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'rachunek/:id',
        component: BillComponent,
        pathMatch: 'full',
        data: { title: 'Rachunek' },
        canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: 'zmien-haslo',
        component: ChangePasswordComponent,
        canActivate: mapToCanActivate([AuthGuard])
      },
      {
        path: '',
        redirectTo: '/zestawienie',
        pathMatch: 'full',
      },
      { path: 'login', component: LoginComponent },
      { path: 'resetuj-haslo', component: ResetPasswordComponent },
      { path: 'nowe-haslo', component: UpdatePasswordComponent },
      { path: '**', component: PageNotFoundComponent }
    ]
  }
];
