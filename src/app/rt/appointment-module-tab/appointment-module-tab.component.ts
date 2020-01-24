import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { ApiService } from 'src/app/shared/api.service';
import { Appointment } from 'src/app/model/appointment';

@Component({
  selector: 'app-appointment-module-tab',
  templateUrl: './appointment-module-tab.component.html',
  styleUrls: ['./appointment-module-tab.component.scss']
})
export class AppointmentModuleTabComponent implements OnInit {
  appointmentDisplayedColumns: string[] = ['no', 'salut', 'name', 'nric', 'apptTime', 'mcrCode'];
  appointmentDataSource: MatTableDataSource<any>;
  appointmentSelection = new SelectionModel<any>(true, []);
  appointmentList: Appointment[] = [];
  constructor(
    private api: ApiService
  ) { }

  ngOnInit() {
    this.api.getAppointments().subscribe(resp => {
      this.appointmentList = resp;
      if (this.appointmentList) {
        console.log(this.appointmentList)
        this.appointmentDataSource = new MatTableDataSource<any>(this.appointmentList);
      }
    })
  }

}
