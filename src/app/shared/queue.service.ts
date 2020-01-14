import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { tap } from 'rxjs/operators';
import { QueueStatus } from '../model/queue-status';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  _rtAllQs = new BehaviorSubject<any[]>([]);
  _rtHoldQs = new BehaviorSubject<any[]>([]);
  _rtMissQs = new BehaviorSubject<any[]>([]);

  _servingQ = new BehaviorSubject<any>({ queueNo: null });

  constructor(
    private api: ApiService,
  ) {
    this.getRtAllQ();
    this.getRtHoldQ();
    this.getRtMissQ();
  }

  getRtAllQ() {
    this.api.getRTAllQ().subscribe(
      resp => {
        this._rtAllQs.next(resp);
        // In case there is serving Q
        if (resp[0].queueStatusId == QueueStatus.SERVING) {
          console.log('serving Q passed');
          console.log(resp[0]);
          this._servingQ.next(resp[0]);
        }
      }
    );
  }

  getRtHoldQ() {
    this.api.getRTHoldQ().subscribe(
      resp => {
        this._rtHoldQs.next(resp);
      }
    );
  }

  getRtMissQ() {
    this.api.getRTMissQ().subscribe(
      resp => {
        this._rtMissQs.next(resp);
      }
    );
  }

  ringAllQ(queue: any) {
    return this.api.ringQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.replaceCurrentQWithResp(this._rtAllQs, newQ);
    }));
  }

  ringHoldQ(queue: any) {
    return this.api.ringQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.removeFromQueueList(this._rtHoldQs, queue);
      this.addRespToQueueList(this._rtAllQs, newQ);
    }));
  }

  ringMissQ(queue: any) {
    return this.api.ringQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.removeFromQueueList(this._rtMissQs, queue);
      this.addRespToQueueList(this._rtAllQs, newQ);
    }));
  }

  missQ(queue: any) {
    return this.api.ringQ(queue.id, 'm').pipe(tap(resp => {
      this.removeFromQueueList(this._rtAllQs, resp);
      this.addRespToQueueList(this._rtMissQs, resp);
    }));
  }

  holdQ(queue: any) {
    return this.api.ringQ(queue.id, 'h').pipe(tap(resp => {
      this.removeFromQueueList(this._rtAllQs, resp);
      this.addRespToQueueList(this._rtHoldQs, resp);
    }));
  }

  addRespToQueueList(_queues: BehaviorSubject<any[]>, response) {
    let newQs = [..._queues.getValue(), response];
    _queues.next(newQs);
  }

  removeFromQueueList(_queues: BehaviorSubject<any[]>, response) {
    let newQs = [..._queues.getValue()].filter(q => q.id != response.id);
    _queues.next(newQs);
  }

  replaceCurrentQWithResp(_queues: BehaviorSubject<any[]>, response) {
    let newQs = [..._queues.getValue()].map(q => {
      if (q.id === response.id) {
        return response;
      }
      return q;
    });
    _queues.next(newQs);
  }

  returnQModifiedWithCallTime(existingQ, responseQ) {
    let callCount, lastCallTime;
    if (existingQ.callCount && existingQ.lastCallTime) {
      callCount = existingQ.callCount + 1;
      lastCallTime = new Date().toISOString();
    } else {
      callCount = 1;
      lastCallTime = new Date().toISOString();
    }
    return {
      ...responseQ,
      callCount: callCount,
      lastCallTime: lastCallTime,
    }
  }

}
