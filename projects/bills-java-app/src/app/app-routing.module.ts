import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'projects/tools/src/public-api';
import { BillComponent, LoginComponent, OverviewComponent, PageNotFoundComponent } from 'projects/views/src/lib/components';

const routes: Routes = [
  {
    path: 'zestawienie',
    component: OverviewComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'rachunek',
    component: BillComponent,
    pathMatch: 'full',
    data: { title: 'Nowy rachunek' },
    canActivate: [AuthGuard]
  },
  {
    path: 'rachunek/:id',
    component: BillComponent,
    pathMatch: 'full',
    data: { title: 'Rachunek' },
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/zestawienie',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
