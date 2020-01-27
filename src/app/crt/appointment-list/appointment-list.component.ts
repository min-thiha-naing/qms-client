import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiService } from 'src/app/shared/api.service';
import { Appointment } from 'src/app/model/appointment';
import { SubSink } from 'subsink';
import { MessengerService } from 'src/app/shared/messenger.service';
import { AppointmentService } from 'src/app/shared/appointment.service';

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
  private rowData = {
    appointment: {
      patientNric: null
    }
  };
  subs = new SubSink();
  constructor(
    private api: ApiService,
    private messenger: MessengerService,
    private APMService: AppointmentService
  ) { }

  ngOnInit() {
    this.api.getAppointments().subscribe(resp => {
      this.appointmentList = resp;
      if (this.appointmentList) {
        console.log(this.appointmentList)
        setTimeout(() => {
          this.APMService.Appointment = this.appointmentList
        }, 1000)
        this.appointmentDataSource = new MatTableDataSource<any>(this.appointmentList);
      }
    });

      //  NOTE Search
      this.subs.add(this.messenger.appointmentSearchResult.subscribe(res =>{
        this.rowData = res;
        console.log(this.rowData)
      }));
  }

}
