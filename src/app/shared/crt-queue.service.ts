import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { SocketClientService } from '../socket-client.service';
import { QueueStatus } from '../model/queue-status';
import { map, tap } from 'rxjs/operators';
import { Helper } from './helper.class';

@Injectable({
  providedIn: 'root'
})
export class CrtQueueService {
  private _crtAllQs = new BehaviorSubject<any[]>([]);
  _crtHoldQs = new BehaviorSubject<any[]>([]);
  _crtMissQs = new BehaviorSubject<any[]>([]);
  _crtServingQ = new BehaviorSubject<any>({ queueNo: null });
  
  get crtAllQs() {
    return this._crtAllQs.asObservable().pipe(map(allQs => {
      // In case there is serving Q
      if (allQs[0] && allQs[0].queueStatusId == QueueStatus.SERVING) {
        allQs[0].planList = Helper.sortLocByOrderId(allQs[0].planList);
        console.log('serving Q passed');
        console.log(allQs[0]);
        this._crtServingQ.next(allQs[0]);
      } else if (allQs[0]) {
        this._crtServingQ.next(null);
      }
      return allQs;
    }))
  }

  get ServingQ() {
    return this._crtServingQ.asObservable().pipe(map(sq => {
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
        // this.addRespToQueueList(this._crtMissQs, q);
      }
    })
  }

  getCrtAllQ() {
    this.api.getCRTAllQ().subscribe(
      resp => {
        this._crtAllQs.next(resp);
      }
    );
  }

  getCrtHoldQ() {
    this.api.getCRTHoldQ().subscribe(
      resp => {
        this._crtHoldQs.next(resp);
      }
    );
  }

  getCrtMissQ() {
    this.api.getCRTMissQ().subscribe(
      resp => {
        this._crtMissQs.next(resp);
      }
    );
  }

  ringCrtAllQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      Helper.replaceCurrentQWithResp(this._crtAllQs, newQ);
    }));
  }

  crtServeAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      Helper.removeFromQueueList(this._crtAllQs, queue);
    }));
  }

  ringCrtHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      Helper.removeFromQueueList(this._crtHoldQs, queue);
      Helper.addRespToQueueList(this._crtAllQs, newQ, 'b');
    }));
  }

  ringCrtMissQ(queue: any) {
    console.log(queue)
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      Helper.removeFromQueueList(this._crtMissQs, queue);
      Helper.addRespToQueueList(this._crtAllQs, newQ, 'b');
    }));
  }

  crtMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      Helper.removeFromQueueList(this._crtAllQs, resp);
      Helper.addRespToQueueList(this._crtMissQs, resp);
    }));
  }

  crtHoldQ(queue: any) {
    console.log("queue")
    console.log(queue)
    return this.api.changeQ(queue.id, 'h').pipe(tap(resp => {
      Helper.removeFromQueueList(this._crtAllQs, resp);
      Helper.addRespToQueueList(this._crtHoldQs, resp);
    }));
  }

  crtAddServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      Helper.replaceCurrentQWithResp(this._crtAllQs, { ...this._crtServingQ.value, planList: [...queue.planList] });
    }));
  }

  deletePlanList(queue: any, orderIdList: number[]) {
    return this.api.deletePlanList(queue.visitId, orderIdList).pipe(tap(() => {
      Helper.replaceCurrentQWithResp(this._crtAllQs, Helper.internalDeletePlanList(queue, orderIdList));
    }))
  }
  
}
