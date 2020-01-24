import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { QueueStatus } from '../model/queue-status';
import { Helper } from './helper.class';
import { queue } from 'rxjs/internal/scheduler/queue';
import { MessengerService } from './messenger.service';

@Injectable({
  providedIn: 'root'
})
export class RoomModuleService {


  private _allQs = new BehaviorSubject<any[]>([]);
  private _holdQs = new BehaviorSubject<any[]>([]);
  private _missQs = new BehaviorSubject<any[]>([]);

  private _servingQ = new BehaviorSubject<any>(null);

  private _searchResultFoundFrontend = new Subject<any>();
  private _searchResultFoundBackend = new Subject<any>();
  private _searchResultNotFound = new Subject<any>();

  get allQs() {
    return this._allQs.asObservable().pipe(map(allQs => {

      // In case there is serving Q
      if (allQs[0] && allQs[0].queueStatusId == QueueStatus.SERVING) {
        allQs[0].planList = Helper.sortLocByOrderId(allQs[0].planList);
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

  get searchResultFoundFrontend() {
    return this._searchResultFoundFrontend.asObservable();
  }

  get searchResultFoundBackend() {
    return this._searchResultFoundBackend.asObservable();
  }
  constructor(
    private api: ApiService,
    private messenger: MessengerService
  ) { }


  getAllQ() {
    this.api.getRTAllQ().subscribe(
      resp => {
        this._allQs.next(resp);
      }
    );
  }

  getHoldQ() {
    this.api.getRTHoldQ().subscribe(
      resp => {
        this._holdQs.next(resp);
      }
    );
  }

  getMissQ() {
    this.api.getRTMissQ().subscribe(
      resp => {
        this._missQs.next(resp);
      }
    );
  }

  ringAllQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      // especially for serving Q which will be returned
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp)
      newQ.planList = queue.planList; //  since response doesnt include planList
      Helper.replaceCurrentQWithResp(this._allQs, newQ);
    }));
  }

  ringHoldQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      newQ.planList = queue.planList;
      Helper.removeFromQueueList(this._holdQs, queue);
      Helper.addRespToQueueList(this._allQs, newQ, 'b');
    }));
  }

  ringMissQ(queue: any) {
    return this.api.changeQ(queue.id, 'R').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      newQ.planList = queue.planList;
      Helper.removeFromQueueList(this._missQs, queue);
      Helper.addRespToQueueList(this._allQs, newQ, 'b');
    }));
  }

  missQ(queue: any) {
    return this.api.changeQ(queue.id, 'm').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      Helper.removeFromQueueList(this._allQs, resp);
      Helper.addRespToQueueList(this._missQs, newQ);
    }));
  }

  holdQ(queue: any) {
    return this.api.changeQ(queue.id, 'h').pipe(tap(resp => {
      let newQ = Helper.returnQModifiedWithCallTime(queue, resp);
      Helper.removeFromQueueList(this._allQs, resp);
      Helper.addRespToQueueList(this._holdQs, newQ);
    }));
  }

  serveAndTransfer(queue: any) {
    return this.api.serveAndTransfer(queue).pipe(tap(resp => {
      Helper.removeFromQueueList(this._allQs, queue);
    }));
  }

  //  return all plan list of serving Q
  addServicePoint(payload) {
    return this.api.addServicePoint(payload).pipe(tap(queue => {
      Helper.replaceCurrentQWithResp(this._allQs, { ...this._servingQ.value, planList: [...queue.planList] });
    }));
  }

  deletePlanList(queue: any, orderIdList: number[]) {
    return this.api.deletePlanList(queue.visitId, orderIdList).pipe(tap(() => {
      Helper.replaceCurrentQWithResp(this._allQs, Helper.internalDeletePlanList(queue, orderIdList));
    }))
  }


  performSearchFeature(searchValue: String) {
    let result = Helper.searchQByQNo(searchValue, this._allQs.value);
    if (result) {
      this._searchResultFoundFrontend.next({
        queue: result,
        fromPanel: 'all'
      });
    } else {
      result = Helper.searchQByQNo(searchValue, this._missQs.value);
      if (result) {
        this._searchResultFoundFrontend.next({
          queue: result,
          fromPanel: 'miss'
        });
      } else {
        this.api.search(searchValue).subscribe(
          res=>{
            if(res){
              
            } else {
              this._searchResultNotFound.next('Not Found');
            }
          }
        )
      }
    }
  }

}
