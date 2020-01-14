import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { tap, map } from 'rxjs/operators';
import { QueueStatus } from '../model/queue-status';
import { SocketClientService } from '../socket-client.service';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private _rtAllQs = new BehaviorSubject<any[]>([]);
  _rtHoldQs = new BehaviorSubject<any[]>([]);
  _rtMissQs = new BehaviorSubject<any[]>([]);

  _servingQ = new BehaviorSubject<any>({ queueNo: null });

  get rtAllQs() {
    return this._rtAllQs.asObservable().pipe(map(allQs => {

      // In case there is serving Q
      if (allQs[0] && allQs[0].queueStatusId == QueueStatus.SERVING) {
        allQs[0].planList = this.sortLocByOrderId(allQs[0].planList);
        console.log('serving Q passed');
        console.log(allQs[0]);
        this._servingQ.next(allQs[0]);
      } else if (allQs[0]) {
        this._servingQ.next(null);
      }

      return allQs;
    }))
  }

  constructor(
    private api: ApiService,
    private socketClient: SocketClientService,
  ) {
    this.getRtAllQ();
    this.getRtHoldQ();
    this.getRtMissQ();
    this.socketClient.onMessage('/user/queue/reply').subscribe(q => {
      if (q.queueStatusId === QueueStatus.MISS) {
        this.addRespToQueueList(this._rtMissQs, q);
      }


    })
  }

  getRtAllQ() {
    this.api.getRTAllQ().subscribe(
      resp => {
        this._rtAllQs.next(resp);
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
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      console.log(newQ);
      this.replaceCurrentQWithResp(this._rtAllQs, newQ);
    }));
  }

  ringHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.removeFromQueueList(this._rtHoldQs, queue);
      this.addRespToQueueList(this._rtAllQs, newQ, 'b');
    }));
  }

  ringMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp);
      this.removeFromQueueList(this._rtMissQs, queue);
      this.addRespToQueueList(this._rtAllQs, newQ, 'b');
    }));
  }

  missQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp);
      this.removeFromQueueList(this._rtAllQs, resp);
      this.addRespToQueueList(this._rtMissQs, newQ);
    }));
  }

  holdQ(queue: any) {
    return this.api.changeQ(queue.id, 'h').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp);
      this.removeFromQueueList(this._rtAllQs, resp);
      this.addRespToQueueList(this._rtHoldQs, newQ);
    }));
  }

  serveAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      this.removeFromQueueList(this._rtAllQs, queue);
    }));
  }

  addRespToQueueList(_queues: BehaviorSubject<any[]>, response, place?: string) {
    if (place && place == 'bottom') {
      let newQs = [response, ..._queues.getValue(),];
      _queues.next(newQs);
    } else {
      let newQs = [..._queues.getValue(), response];
      _queues.next(newQs);
    }
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
    if (existingQ.callCount) {
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

  //  return all plan list of serving Q
  addServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      this.replaceCurrentQWithResp(this._rtAllQs, { ...this._servingQ.value, planList: this.sortLocByOrderId([...this._servingQ.value.planList, ...queue.planList]) });
    }));
  }

  sortLocByOrderId(locList: any[]) {
    return locList.sort((a, b) => a.orderId - b.orderId);
  }

}
