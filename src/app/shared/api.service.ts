import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Appointment } from '../model/appointment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  constructor(
    private http: HttpClient,
  ) { }

  getRTAllQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatus/all/${sessionStorage.getItem('terminalId')}`);
  }

  getRTHoldQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatus/hold/${sessionStorage.getItem('terminalId')}`);
  }

  getRTMissQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatus/miss/${sessionStorage.getItem('terminalId')}`);
  }

  getCRTAllQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatusPayment/ALL/5404`);
  }

  getCRTHoldQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatusPayment/HOLD/5404`);
  }

  getCRTMissQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatusPayment/MISS/5404`);
  }


  ringQ(id, status) {
    return this.http.put<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionQueue/${id}/${status}/${sessionStorage.getItem('terminalId')}`,{});
  }


  getDepartments(){
    return this.http.get<any[]>(`${environment.baseUrl}/departments/department`);
  }

  getWorkgroupsByDpt(dptId){
    return this.http.get<any[]>(`${environment.baseUrl}/workgroups/listWorkgroupByDepartmentId/${dptId}`);
  }

  getAppointments(){
    return this.http.get<Appointment[]>(`${environment.baseUrl}/liveAppointmentPatients/liveAppointmentPatient`)
  }

}
