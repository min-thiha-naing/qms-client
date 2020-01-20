import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-module-tab',
  templateUrl: './appointment-module-tab.component.html',
  styleUrls: ['./appointment-module-tab.component.scss']
})
export class AppointmentModuleTabComponent implements OnInit {
  appointmentDisplayedColumns: string[] = ['no', 'patientTitle', 'patientName', 'patientNric', 'apptTimestamp', 'apptDoctorMCR'];
  appointmentDataSource: MatTableDataSource<any>;
  appointmentSelection = new SelectionModel<any>(true, []);
  constructor() { } 

  ngOnInit() {
   
  }

}
