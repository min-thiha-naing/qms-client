import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDividerModule,
  MatToolbarModule,
  MatRadioModule,
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatListModule,
  MatTabsModule,
  MatTableModule,
  MatGridListModule,
  MatCheckboxModule,
  MatDialogModule,
} from '@angular/material';

import {DropdownModule} from 'primeng/dropdown';



@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  exports: [
    MatDividerModule,
    MatToolbarModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatTabsModule,
    MatTableModule,
    MatGridListModule,
    MatCheckboxModule,
    MatDialogModule,
    DropdownModule
,
  ]
})
export class MaterialModule { }
