import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RtComponent } from './rt.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { HeaderComponent } from '../shared/layout/header/header.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RoomModuleTabComponent } from './room-module-tab/room-module-tab.component';
import { AddServicePointComponent } from './add-service-point/add-service-point.component';
import { MatDialogModule, MatAutocompleteModule, MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from '../shared/shared.module';
import { AppointmentModuleTabComponent } from './appointment-module-tab/appointment-module-tab.component';
import { FreeCallComponent } from './free-call/free-call.component';

const routes: Routes = [
  {
    path: '',
    component: RtComponent,
  }
];



@NgModule({
  declarations: [
    RtComponent,
    RoomModuleTabComponent,
    AddServicePointComponent,
    AppointmentModuleTabComponent,
    FreeCallComponent,
  ],
  entryComponents: [
    AddServicePointComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    FlexLayoutModule,
    MatDialogModule,
    FormsModule,
    NgxLoadingModule,
    MatAutocompleteModule,
    MatSelectModule,
    ReactiveFormsModule,
    SharedModule
  ],
  exports: [
    RouterModule,
  ]
})
export class RtModule { }
