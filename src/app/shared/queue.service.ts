import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { tap, map } from 'rxjs/operators';
import { QueueStatus } from '../model/queue-status';
import { SocketClientService } from '../socket-client.service';
import { Helper } from './helper.class';

@Injectable({
  providedIn: 'root'
})
export class QueueService {

  private _rtAllQs = new BehaviorSubject<any[]>([]);
  _rtHoldQs = new BehaviorSubject<any[]>([]);
  _rtMissQs = new BehaviorSubject<any[]>([]);

  private _servingQ = new BehaviorSubject<any>(null);
  /////crt
  private _crtAllQs = new BehaviorSubject<any[]>([]);
  private _regAllQs = new BehaviorSubject<any[]>([]);
  _crtHoldQs = new BehaviorSubject<any[]>([]);
  _crtMissQs = new BehaviorSubject<any[]>([]);

  _crtServingQ = new BehaviorSubject<any>({ queueNo: null });
  _regServingQ = new BehaviorSubject<any>({ queueNo: null });

  get rtAllQs() {
    return this._rtAllQs.asObservable().pipe(map(allQs => {

      // In case there is serving Q
      if (allQs[0] && allQs[0].queueStatusId == QueueStatus.SERVING) {
        allQs[0].planList = Helper.sortLocByOrderId(allQs[0].planList);
        console.log('serving Q passed');
        console.log(allQs[0]);
        this._servingQ.next(allQs[0]);
      } else if (allQs[0]) {
        this._servingQ.next(null);
      }

      return allQs;
    }))
  }

  get servingQ() {
    return this._servingQ.asObservable().pipe(map(sq => {
      if (sq && sq.planList)
        return { ...sq, planList: Helper.sortLocByOrderId(sq.planList) }
      else
        return sq;
    }));
  }

  constructor(
    private api: ApiService,
    private socketClient: SocketClientService,
  ) {
    this.socketClient.onMessage('/user/queue/reply').subscribe(q => {
      if (q.queueStatusId === QueueStatus.MISS) {
        Helper.addRespToQueueList(this._rtMissQs, q);
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
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      newQ.planList = queue.planList; //  since response doesnt include planList
      Helper.replaceCurrentQWithResp(this._rtAllQs, newQ);
    }));
  }

  ringHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      newQ.planList = queue.planList;
      Helper.removeFromQueueList(this._rtHoldQs, queue);
      Helper.addRespToQueueList(this._rtAllQs, newQ, 'b');
    }));
  }

  ringMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      newQ.planList = queue.planList;
      Helper.removeFromQueueList(this._rtMissQs, queue);
      Helper.addRespToQueueList(this._rtAllQs, newQ, 'b');
    }));
  }

  missQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      Helper.removeFromQueueList(this._rtAllQs, resp);
      Helper.addRespToQueueList(this._rtMissQs, newQ);
    }));
  }

  holdQ(queue: any) {
    return this.api.changeQ(queue.id, 'h').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      Helper.removeFromQueueList(this._rtAllQs, resp);
      Helper.addRespToQueueList(this._rtHoldQs, newQ);
    }));
  }

  serveAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      Helper.removeFromQueueList(this._rtAllQs, queue);
    }));
  }

  //  return all plan list of serving Q
  addServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      Helper.replaceCurrentQWithResp(this._rtAllQs, { ...this._servingQ.value, planList: [...queue.planList] });
    }));
  }

  deletePlanList(queue: any, orderIdList: number[]) {
    return this.api.deletePlanList(queue.visitId, orderIdList).pipe(tap(() => {
      Helper.replaceCurrentQWithResp(this._rtAllQs, Helper.internalDeletePlanList(queue, orderIdList));
    }))
  }


}
