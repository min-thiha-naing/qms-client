import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { QueueStatus } from '../model/queue-status';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  _rtAllQs= new BehaviorSubject<any[]>([]);
  _rtHoldQs= new BehaviorSubject<any[]>([]);
  _rtMissQs= new BehaviorSubject<any[]>([]);

  _servingQ = new BehaviorSubject<any>({queueNo: null});

  constructor(
    private api: ApiService,
  ) {
    this.getRtAllQ();
    this.getRtHoldQ();
    this.getRtMissQ();
  }

  getRtAllQ(){
    this.api.getRTAllQ().subscribe(
      resp => {
        this._rtAllQs.next(resp);
        // In case there is serving Q
        if(resp[0].queueStatusId == QueueStatus.SERVING){
          console.log('serving Q passed');
          console.log(resp[0]);
          this._servingQ.next(resp[0]);
        }
      }
    );
  }

  getRtHoldQ(){
    this.api.getRTHoldQ().subscribe(
      resp => {
        this._rtHoldQs.next(resp);
      }
    );
  }

  getRtMissQ(){
    this.api.getRTMissQ().subscribe(
      resp => {
        this._rtMissQs.next(resp);
      }
    );
  }

  serveQ(queue: any){
    return this.api.ringQ(queue.id, 'R').pipe(tap(resp=>{
      this.replaceCurrentQWithResp(this._rtAllQs, resp);
    }));
  }

  replaceCurrentQWithResp(_queues: BehaviorSubject<any[]>, response){
    let newQs = [..._queues.getValue()].map(q=>{
      if(q.id === response.id){
        return response;
      }
      return q;
    });
    _queues.next(newQs);
  }
}
