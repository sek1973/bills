import { Routes, mapToCanActivate } from '@angular/router';
import { AuthGuard } from 'projects/tools/src/public-api';
import { BillComponent, LoginComponent, OverviewComponent, PageNotFoundComponent } from './components';
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
        path: '',
        redirectTo: '/zestawienie',
        pathMatch: 'full',
      },
      { path: 'login', component: LoginComponent },
      { path: '**', component: PageNotFoundComponent }
    ]
  }
];
