import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource, MatTable, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntil, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { QueueService } from 'src/app/shared/queue.service';
import { QueueStatus, DestinationStatus } from 'src/app/model/queue-status';
import { TransformerService } from 'src/app/shared/transformer.service';
import { ApiService } from 'src/app/shared/api.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  queueDisplayedColumns: string[] = ['qNo', 'name', 'mrn', 'visitType', 'apptTime', 'waitTime', 'tWaitTime', 'callTime', 'remarks'];
  queueSelection = new SelectionModel<any>(true, []);

  locationDisplayedColumns: string[] = ['location', 'inQ', 'orderId','select' ];
  destLocationDS = new MatTableDataSource<any>([]);
  destStatus = DestinationStatus;
 
  @ViewChild('journeyTable', { static: true }) journeyTable: MatTable<any>;
  journeyDisplayedColumns: string[] = [ 'clinic', 'location', 'apptTime', 'createdBy', 'status','select'];
  journeyDataSource: MatTableDataSource<any>;
  journeySelection = new SelectionModel<any>(true, []);

  allQDS: MatTableDataSource<any>;
  allQTableHeader = {
    total: 0,
    fresh: 0,
    missback: 0,
    miss: 0,
    waiting: 0,
  }

  selectedRowData = {
    queue: {
      queueNo: null
    },
    fromPanel: ''
  };
  servingQ: any = null;  //  will always be from allQ
  subs = new SubSink();
  departments: any[] = [];
  srcLocationDS = new MatTableDataSource<any>([]);

  constructor(
    private qS: QueueService,
    private transform: TransformerService,
    private dialog: MatDialog,
    private api: ApiService
  ) { }
  ngOnInit() {
    this.qS.getRegAllQ();
    this.api.getDepartments().subscribe(resp => this.departments = resp);
    this.subs.add(this.qS.CrtRegAllQs.subscribe(Qs => {
      this.allQDS = new MatTableDataSource<any>(Qs);
      console.log(this.allQDS)
      this.allQTableHeader = {
        total: Qs.length,
        fresh: Qs.filter(el => el.queueStatusId == QueueStatus.FRESH).length,
        missback: Qs.filter(el => el.queueStatusId == QueueStatus.MISSBACK).length,
        miss: Qs.filter(el => el.queueStatusId == QueueStatus.MISS).length,
        waiting: Qs.filter(el => el.queueStatusId == QueueStatus.WAITING).length,
      }

      if (this.allQDS.data[0]) {
        this.selectedRowData = {
          queue: {
            queueNo: this.allQDS.data[0].queueNo,
            ...this.allQDS.data[0],
          },
          fromPanel: 'all'
        }
      }
    }));

    this.subs.add(this.qS._regServingQ.asObservable().subscribe(Q => {
      this.servingQ = Q;
      console.log(this.servingQ)
      if (this.servingQ) {
        if (this.servingQ.planList) {
          console.log(this.transform.planListToDestLocList(this.servingQ.planList));
          this.journeyDataSource = new MatTableDataSource<any>(this.transform.planListToDestLocList(this.servingQ.planList));
        }
        this.selectedRowData = {
          queue: {
            queueNo: this.servingQ.queueNo,
            ...this.servingQ,
          },
          fromPanel: 'all'
        };
      }
    }));
    console.log(this.selectedRowData)
  }

  onClickRow(queue, fromPanel) {
    this.selectedRowData = {
      queue: queue,
      fromPanel: fromPanel,
    };
    console.log(this.selectedRowData)
  }

  ////////ADD SERVICE POINT////////////////
  onChangeDepartment(ev) {
    this.api.getWorkgroupsByDpt(ev.target.value)
      .pipe(map(resp => {
        return resp.map(element => this.transformWGtoSrcLoc(element))
      }))
      .subscribe(resp => {
        this.srcLocationDS = new MatTableDataSource(resp);
        console.log('SRC: ');
        console.log(this.srcLocationDS.data);
      });
  }

  transformWGtoSrcLoc(wg: any) {
    return {
      ...wg,
      workgroupId: wg.id,
      isSelected: false,
      orderId: null,
    };
  }

  onToggleSrcLoc(srcEl) {
    //  auto increment orderId
    if (srcEl.isSelected) {
      srcEl.orderId = Math.max(...(this.srcLocationDS.data.filter(el => el.isSelected == true).map(el => el.orderId))) + 1;
    } else {
      srcEl.orderId = null;
    }
  }

  sortChosenSrcLocsByOrder(srcLocs: any[]) {
    return srcLocs
      .filter(el => el.isSelected == true)
      .sort((a, b) => {
        return a.orderId - b.orderId;
      })
  }

  transformSrcToDestLoc(srcLocs: any[]) {
    // make sure src is already sorted
    return srcLocs.map(el => {
      return {
        ...el,
        actFlag: this.destStatus.WAITING,
        isSelected: false,
      }
    })
  }

  incrementOrderId(list: any[], startingOrderId: number) {
    return list.map(el => { return { ...el, orderId: startingOrderId++ } });
  }

  computeLargestOrderId(list: any[]): number {
    return Math.max(...list.map(el => el.orderId));
  }

  addToFirst() {
    let upperDestLs = this.destLocationDS.data.filter(el => el.actFlag != this.destStatus.WAITING);

    let newDestLs = this.sortChosenSrcLocsByOrder(this.srcLocationDS.data);
    newDestLs = this.transformSrcToDestLoc(newDestLs);
    newDestLs = this.incrementOrderId(newDestLs, this.computeLargestOrderId(upperDestLs) + 1);

    let belowDestLs = this.destLocationDS.data.filter(el => el.actFlag == this.destStatus.WAITING);
    belowDestLs = this.incrementOrderId(belowDestLs, this.computeLargestOrderId(newDestLs) + 1);

    this.destLocationDS = new MatTableDataSource<any>([
      ...upperDestLs,
      ...newDestLs,
      ...belowDestLs].sort((a, b) => { return a.orderId - b.orderId }));
    console.log('DEST');
    console.log(this.destLocationDS.data);
  }

  addToLast() {
    let upperDestLs = this.destLocationDS.data;

    let newDestLs = this.sortChosenSrcLocsByOrder(this.srcLocationDS.data);
    newDestLs = this.transformSrcToDestLoc(newDestLs);
    newDestLs = this.incrementOrderId(newDestLs, this.computeLargestOrderId(upperDestLs) + 1);

    this.destLocationDS = new MatTableDataSource<any>([
      ...upperDestLs,
      ...newDestLs].sort((a, b) => { return a.orderId - b.orderId }));
    console.log('DEST');
    console.log(this.destLocationDS.data);
  }

  onRemove() {
    this.destLocationDS = new MatTableDataSource(this.destLocationDS.data.filter(el => el.isSelected == false));
  }

  onDeselectAll() {
    this.srcLocationDS.data.forEach(el => {
      el.isSelected = false;
      el.orderId = null;
    })
  }

  getDestLocsByActFlag(destLocs: any[], status: any) {
    return destLocs.filter(el => el.actFlag == status);
  }
//////////////////////////////////////////////////////////////
/////////STANDARE ACTION///////////////////

///////////////////////////////////////////
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
