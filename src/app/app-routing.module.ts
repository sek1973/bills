import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent, LoginComponent, OverviewComponent, PageNotFoundComponent } from './components';
import { AuthGuard } from './services';

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
    canActivate: [AuthGuard]
  },
  { path: 'login', component: LoginComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    CommonModule, RouterModule.forRoot(
      routes,
      { enableTracing: false },
    ),
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
