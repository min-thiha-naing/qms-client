import { Injectable } from '@angular/core';
import { Helper } from './helper.class';
import { Appointment } from '../model/appointment';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  appointList: any
  constructor(
  ) {
  }

  set Appointment(app: any){
    this.appointList = app
  }

  search(searchValue: String) {
    if(this.appointList){
      let result = Helper.searchAppointment(searchValue, this.appointList);
      if (result) {
        return {
          appointment: result,
        };
      } else {
        return null;
      }
    }
  }
}
