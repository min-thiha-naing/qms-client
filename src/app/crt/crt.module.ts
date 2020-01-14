import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, Routes } from '@angular/router';
import { MaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule } from '@angular/material';
import { CrtComponent } from './crt.component';
import { PaymentTabComponent } from './payment-tab/payment-tab.component';
import { HeaderComponent } from '../shared/layout/header/header.component';
import { RegistrationComponent } from './registration/registration.component';
import { AppointmentListComponent } from './appointment-list/appointment-list.component';
import { CRtService } from './crt.service';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: '',
    component: CrtComponent,
  }
];

@NgModule({
  declarations: [
    PaymentTabComponent,
    CrtComponent,
    RegistrationComponent,
    AppointmentListComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FlexLayoutModule,
    MatDialogModule,
    FormsModule,
    SharedModule
  ],
  exports: [
    RouterModule,
  ]
})
export class CrtModule { }
