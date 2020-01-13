import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AuthService } from './auth/auth.service';
import { TestComponent } from './test/test.component';


const routes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
    resolve: {
      terminal: AuthService,
    }
  },
  {
    path: 'test',
    component: TestComponent,
  },
  {
    path: 'rt',
    loadChildren: './rt/rt.module#RtModule',
  },
  {
    path: '**',
    redirectTo: 'login',
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
