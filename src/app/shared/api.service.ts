import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Appointment } from '../model/appointment';
import { map } from 'rxjs/operators';
import { Helper } from './helper.class';

@Injectable({
  providedIn: 'root'
})
export class ApiService {


  constructor(
    private http: HttpClient,
  ) { }

  getRTAllQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatus/all/${sessionStorage.getItem('terminalId')}`)
    .pipe(map(resp => {return resp.map(el => Helper.addPropToRawQ(el))}));
  }

  getRTHoldQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatus/hold/${sessionStorage.getItem('terminalId')}`)
    .pipe(map(resp => {return resp.map(el => Helper.addPropToRawQ(el))}));
  }

  getRTMissQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatus/miss/${sessionStorage.getItem('terminalId')}`)
    .pipe(map(resp => {return resp.map(el => Helper.addPropToRawQ(el))}));
  }

  changeQ(id, status) {
    return this.http.put<any>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionQueue/${id}/${status}/${sessionStorage.getItem('terminalId')}`, {});
  }

  getCRTAllQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatusPayment/ALL/3555`)
    .pipe(map(resp => {return resp.map(el => Helper.addPropToRawQ(el))}));
  }

  getCRTHoldQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatusPayment/HOLD/3555`)
    .pipe(map(resp => {return resp.map(el => Helper.addPropToRawQ(el))}));
  }

  getCRTMissQ() {
    return this.http.get<any[]>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionByStatusPayment/MISS/3555`)
    .pipe(map(resp => {return resp.map(el => Helper.addPropToRawQ(el))}));
  }


  getDepartments() {
    return this.http.get<any[]>(`${environment.baseUrl}/departments/department`);
  }

  getWorkgroupsByDpt(dptId) {
    return this.http.get<any[]>(`${environment.baseUrl}/workgroups/listWorkgroupByDepartmentId/${dptId}`);
  }

  //  return Q
  addServicePoint(payload) {
    return this.http.put<any>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionQueue/addServicePoint`, payload);
  }

  serveAndTransfer(queue) {
    return this.http.put<any>(`${environment.baseUrl}/liveTransactionQueues/liveTransactionQueue/serve`, queue);
  }
  getAppointments() {
    return this.http.get<Appointment[]>(`${environment.baseUrl}/liveAppointmentPatients/liveAppointmentPatient`)
  }

  deletePlanList(visitId: number, orderIdList: number[]){
    return this.http.delete(`${environment.baseUrl}/liveTransactionQueues/liveTransactionQueue/removeplanListByVisitId/${visitId}/${orderIdList.toString()}`)
  }

}
