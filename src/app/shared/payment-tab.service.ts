import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { SocketClientService } from '../socket-client.service';
import { QueueStatus } from '../model/queue-status';
import { map, tap } from 'rxjs/operators';
import { Helper } from './helper.class';
import { MessengerService } from './messenger.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentTabService {
  private _allQs = new BehaviorSubject<any[]>([]);
  private _holdQs = new BehaviorSubject<any[]>([]);
  private _missQs = new BehaviorSubject<any[]>([]);
  private _servingQ = new BehaviorSubject<any>(null);

  get allQs() {
    return this._allQs.asObservable().pipe(map(allQs => {
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
    return this._servingQ.asObservable().pipe(
      map(sq => {
        if (sq && sq.planList)
          return { ...sq, planList: Helper.sortLocByOrderId(sq.planList) }
        else
          return sq;
      }),
      tap(sq => this.messenger.servingQ = sq));
  }

  get holdQs() {
    return this._holdQs.asObservable();
  }

  get missQs() {
    return this._missQs.asObservable();
  }

  constructor(
    private api: ApiService,
    private messenger: MessengerService,
  ) {

  }

  getAllQ() {
    this.api.getCRTAllQ().subscribe(
      resp => {
        this._allQs.next(resp);
      }
    );
  }

  getHoldQ() {
    this.api.getCRTHoldQ().subscribe(
      resp => {
        this._holdQs.next(resp);
      }
    );
  }

  getMissQ() {
    this.api.getCRTMissQ().subscribe(
      resp => {
        this._missQs.next(resp);
      }
    );
  }

  ringCrtAllQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      Helper.replaceCurrentQWithResp(this._allQs, newQ);
    }));
  }

  crtServeAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      Helper.removeFromQueueList(this._allQs, queue);
    }));
  }

  ringCrtHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      Helper.removeFromQueueList(this._holdQs, queue);
      Helper.addRespToQueueList(this._allQs, newQ, 'b');
    }));
  }

  ringCrtMissQ(queue: any) {
    console.log(queue)
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      Helper.removeFromQueueList(this._missQs, queue);
      Helper.addRespToQueueList(this._allQs, newQ, 'b');
    }));
  }

  crtMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      Helper.removeFromQueueList(this._allQs, resp);
      Helper.addRespToQueueList(this._missQs, resp);
    }));
  }

  crtHoldQ(queue: any) {
    console.log("queue")
    console.log(queue)
    return this.api.changeQ(queue.id, 'h').pipe(tap(resp => {
      Helper.removeFromQueueList(this._allQs, resp);
      Helper.addRespToQueueList(this._holdQs, resp);
    }));
  }

  crtAddServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      Helper.replaceCurrentQWithResp(this._allQs, { ...this._servingQ.value, planList: [...queue.planList] });
    }));
  }

  deletePlanList(queue: any, orderIdList: number[]) {
    return this.api.deletePlanList(queue.visitId, orderIdList).pipe(tap(() => {
      Helper.replaceCurrentQWithResp(this._allQs, Helper.internalDeletePlanList(queue, orderIdList));
    }))
  }

  search(searchValue: String) {
    let result = Helper.searchQByQNo(searchValue, this._allQs.value);
    if (result) {
      return {
        queue: result,
        fromPanel: 'all'
      };
    } else {
      result = Helper.searchQByQNo(searchValue, this._missQs.value);
      if (result) {
        return {
          queue: result,
          fromPanel: 'miss'
        };
      } else {
        return null;
      }
    }
  }

  handleWebSocketQ(queue){
    switch(queue.queueStatusId){
      case QueueStatus.SERVING: {
        Helper.removeFromQueueList(this._allQs, queue);
        Helper.removeFromQueueList(this._missQs, queue)
        break;
      }
      case QueueStatus.MISS: {
        Helper.addRespToQueueList(this._missQs, queue, 'b');
        break;
      }
    }
  }
}
