import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RtComponent } from './rt.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { HeaderComponent } from '../shared/layout/header/header.component';
import { FlexLayoutModule } from '@angular/flex-layout';

const routes: Routes = [
  {
    path: '',
    component: RtComponent,
  }
];



@NgModule({
  declarations: [
    RtComponent,
    HeaderComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FlexLayoutModule,
  ],
  exports: [
    RouterModule,
  ]
})
export class RtModule { }
