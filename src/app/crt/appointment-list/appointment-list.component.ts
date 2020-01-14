import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiService } from 'src/app/shared/api.service';
import { Appointment } from 'src/app/model/appointment';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
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
