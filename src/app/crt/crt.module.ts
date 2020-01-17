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
import { ServicePointComponent } from './service-point/service-point.component';
import { NgxLoadingModule } from 'ngx-loading';

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
    AppointmentListComponent,
    ServicePointComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FlexLayoutModule,
    MatDialogModule,
    FormsModule,
    SharedModule,
    NgxLoadingModule
  ],
  exports: [
    RouterModule,
  ],
  entryComponents:[ServicePointComponent]
})
export class CrtModule { }
