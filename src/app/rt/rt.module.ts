import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RtComponent } from './rt.component';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { HeaderComponent } from '../shared/layout/header/header.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RoomModuleTabComponent } from './room-module-tab/room-module-tab.component';
import { AddServicePointComponent } from './add-service-point/add-service-point.component';
import { MatDialogModule } from '@angular/material';
import { FormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';

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
    RoomModuleTabComponent,
    AddServicePointComponent,
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
  ],
  exports: [
    RouterModule,
  ]
})
export class RtModule { }
