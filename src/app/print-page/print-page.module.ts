import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';

import { FlexLayoutModule } from '@angular/flex-layout';
import { MatDialogModule, MatAutocompleteModule, MatSelectModule } from '@angular/material';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxLoadingModule } from 'ngx-loading';
import { SharedModule } from '../shared/shared.module';

import { PrintPageComponent } from './print-page.component';
import { NgxPrintModule } from 'ngx-print';
import { NgxBarcodeModule } from 'ngx-barcode';
const routes: Routes = [
  {
    path: '',
    component: PrintPageComponent,
  }
];



@NgModule({
  declarations: [
  PrintPageComponent
  ],
  entryComponents: [
   
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
    SharedModule,
    NgxPrintModule,
    NgxBarcodeModule
  ],
  exports: [
    RouterModule,
  ]
})
export class PrintPageModule { }
