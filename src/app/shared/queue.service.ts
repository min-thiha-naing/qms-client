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

  get CrtRegAllQs(){
    return this._regAllQs.asObservable().pipe(map(allQs=>{
      if (allQs[0] && allQs[0].queueStatusId == QueueStatus.SERVING) {
        allQs[0].planList = Helper.sortLocByOrderId(allQs[0].planList);
        console.log('serving Q passed');
        console.log(allQs[0]);
        this._regServingQ.next(allQs[0]);
      } else if (allQs[0]) {
        this._regServingQ.next(null);
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
    this.getRtAllQ();
    this.getRtHoldQ();
    this.getRtMissQ();
    this.getCrtAllQ();
    this.getCrtHoldQ();
    this.getCrtMissQ();
    this.socketClient.onMessage('/user/queue/reply').subscribe(q => {
      if (q.queueStatusId === QueueStatus.MISS) {
        this.addRespToQueueList(this._rtMissQs, q);
      }


    })
  }

  getRegAllQ(){
    this.api.getAllReg().subscribe(
      resp=>{
        this._regAllQs.next(resp)
      }
    )
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
  ///////crt
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
  ///////
  ringAllQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      newQ.planList = queue.planList; //  since response doesnt include planList
      this.replaceCurrentQWithResp(this._rtAllQs, newQ);
    }));
  }

  ringHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp);
      newQ.planList = queue.planList;
      this.removeFromQueueList(this._rtHoldQs, queue);
      this.addRespToQueueList(this._rtAllQs, newQ, 'b');
    }));
  }

  ringMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp);
      newQ.planList = queue.planList;
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


  ringCrtAllQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.replaceCurrentQWithResp(this._crtAllQs, newQ);
    }));
  }

  serveAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      this.removeFromQueueList(this._rtAllQs, queue);
    }));
  }

  crtServeAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      this.removeFromQueueList(this._crtAllQs, queue);
    }));
  }

  addRespToQueueList(_queues: BehaviorSubject<any[]>, response, place?: string) {
    if (place && place == 'b') {
      let newQs = [response, ..._queues.getValue(),];
      _queues.next(newQs);
    } else {
      let newQs = [..._queues.getValue(), response];
      _queues.next(newQs);
    }
  }
  ringCrtHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.removeFromQueueList(this._rtHoldQs, queue);
      this.addRespToQueueList(this._crtAllQs, newQ, 'b');
    }));
  }

  ringCrtMissQ(queue: any) {
    console.log(queue)
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = this.returnQModifiedWithCallTime(queue, resp)
      this.removeFromQueueList(this._crtMissQs, queue);
      this.addRespToQueueList(this._crtAllQs, newQ, 'b');
    }));
  }

  crtMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      this.removeFromQueueList(this._crtAllQs, resp);
      this.addRespToQueueList(this._crtMissQs, resp);
    }));
  }

  crtHoldQ(queue: any) {
    console.log("queue")
    console.log(queue)
    return this.api.changeQ(queue.id, 'h').pipe(tap(resp => {
      this.removeFromQueueList(this._crtAllQs, resp);
      this.addRespToQueueList(this._crtHoldQs, resp);
    }));
  }
  /////////

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
    return {
      ...responseQ,
      callCount: existingQ.callCount + 1,
      lastCallTime: new Date().toISOString(),
    }
  }

  //  return all plan list of serving Q
  addServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      this.replaceCurrentQWithResp(this._rtAllQs, { ...this._servingQ.value, planList: [...queue.planList] });
    }));
  }

  crtAddServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      this.replaceCurrentQWithResp(this._crtAllQs, { ...this._crtServingQ.value, planList: [...queue.planList] });
    }));
  }

  deletePlanList(queue: any, orderIdList: number[]) {
    return this.api.deletePlanList(queue.visitId, orderIdList).pipe(tap(() => {
      this.replaceCurrentQWithResp(this._rtAllQs, this.internalDeletePlanList(queue, orderIdList));
    }))
  }

  internalDeletePlanList(queue: any, orderIdList: number[]) {
    queue.planList = (<Array<any>>queue.planList).filter(pl => !orderIdList.includes(pl.orderId));
    return queue;
  }

}
