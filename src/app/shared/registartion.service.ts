import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { QueueStatus } from '../model/queue-status';
import { map, tap } from 'rxjs/operators';
import { Helper } from './helper.class';
import { ApiService } from './api.service';
import { SocketClientService } from '../socket-client.service';
import { MessengerService } from './messenger.service';

@Injectable({
  providedIn: 'root'
})
export class RegistartionService {
  private _regAllQs = new BehaviorSubject<any[]>([]);
  _regServingQ = new BehaviorSubject<any>(null);

  get CrtRegAllQs() {
    return this._regAllQs.asObservable().pipe(map(allQs => {
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

  get ServingQ() {
    return this._regServingQ.asObservable().pipe(
      map(sq => {
        if (sq && sq.planList)
          return { ...sq, planList: Helper.sortLocByOrderId(sq.planList) }
        else
          return sq;
      }),
      tap(sq => this.messenger.servingQ = sq));
  }

  constructor(
    private api: ApiService,
    private socketClient: SocketClientService,
    private messenger: MessengerService,
  ) {
    this.socketClient.onMessage('/user/queue/reply').subscribe(q => {
      if (q.queueStatusId === QueueStatus.MISS) {
        // this.addRespToQueueList(this._rtMissQs, q);
      }

    })
  }

  getRegAllQ() {
    this.api.getAllReg().subscribe(
      resp => {
        this._regAllQs.next(resp)
      }
    )
  }

  ringRegAllQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      console.log(resp)
      // especially for serving Q which will be returned
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      console.log(newQ)
      newQ.planList = queue.planList; //  since response doesnt include planList
      Helper.replaceCurrentQWithResp(this._regAllQs, newQ);
    }));
  }

  regMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      let oldQ = queue;
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      oldQ.queueStatusId = newQ.queueStatusId;
      Helper.removeFromQueueList(this._regAllQs, resp);
      Helper.addRespToQueueList(this._regAllQs, oldQ, 'b');
    }))
  }

  serveAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      Helper.removeFromQueueList(this._regAllQs, queue);
    }));
  }

  remark(queue: any, dummy: any) {
    console.log(queue)
    return this.api.addRemark(dummy).pipe(tap(resp => {
      Helper.removeFromQueueList(this._regAllQs, queue);
      Helper.addRespToQueueList(this._regAllQs, queue)
    }))
  }

  search(searchValue: String) {
    let result = Helper.searchQByQNo(searchValue, this._regAllQs.value);
    if (result) {
      return {
        queue: result,
        fromPanel: 'all'
      };
    } else {
      return null;
    }
  }
}
