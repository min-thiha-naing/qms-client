import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, Routes } from '@angular/router';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material';
import { CrtComponent } from './crt.component';
import { PaymentTabComponent } from './payment-tab/payment-tab.component';

const routes: Routes = [
  {
    path: '',
    component: CrtComponent,
  }
];

@NgModule({
  declarations: [PaymentTabComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FlexLayoutModule,
    MatDialogModule
  ],
  exports: [
    RouterModule,
  ]
})
export class CrtModule { }
