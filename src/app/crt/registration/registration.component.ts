import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource, MatTable, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntil, map } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { QueueService } from 'src/app/shared/queue.service';
import { QueueStatus, DestinationStatus } from 'src/app/model/queue-status';
import { ApiService } from 'src/app/shared/api.service';
import { PopUpWindowComponent } from 'src/app/pop-up-window/pop-up-window.component';
import { RegistartionService } from 'src/app/shared/registartion.service';
import { Helper } from 'src/app/shared/helper.class';
import { ConfirmDialogComponent, ConfirmDialogModel } from 'src/app/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  queueDisplayedColumns: string[] = ['qNo', 'name', 'mrn', 'visitType', 'apptTime', 'waitTime', 'tWaitTime', 'callTime','status', 'remarks'];
  queueSelection = new SelectionModel<any>(true, []);

  locationDisplayedColumns: string[] = ['location', 'inQ', 'orderId', 'select'];
  destLocationDS = new MatTableDataSource<any>([]);
  destStatus = DestinationStatus;

  @ViewChild('journeyTable', { static: true }) journeyTable: MatTable<any>;
  journeyDisplayedColumns: string[] = ['clinic', 'location', 'apptTime', 'createdBy', 'status', 'select'];
  journeyDataSource: MatTableDataSource<any>;

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
  loading = false;
  fetch = false;
  qServingStatus = QueueStatus.SERVING;
  constructor(
    private qS: QueueService,
    private regQS: RegistartionService,
    private dialog: MatDialog,
    private api: ApiService
  ) { }
  ngOnInit() {

    this.regQS.getRegAllQ();
    this.api.getDepartments().subscribe(resp => this.departments = resp);
    this.subs.add(this.regQS.CrtRegAllQs.subscribe(Qs => {
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
        this.api.search(this.allQDS.data[0].queueNo).subscribe(resp=>{
          console.log(resp)
        })
      }
    }));

    this.subs.add(this.regQS._regServingQ.asObservable().subscribe(Q => {
      this.servingQ = Q;
      console.log(this.servingQ)
      if (this.servingQ) {
        if (this.servingQ.planList) {
          this.journeyDataSource = new MatTableDataSource<any>(Helper.transformPlanListToDestLocList(this.servingQ.planList));
        }
        this.selectedRowData = {
          queue: {
            queueNo: this.servingQ.queueNo,
            ...this.servingQ,
          },
          fromPanel: 'all'
        };
        this.api.search(this.servingQ.queueNo).subscribe(resp=>{
          console.log(resp)
        })
      }
      else{
        this.journeyDataSource = new MatTableDataSource<any>([])
      }
    }));
    console.log(this.selectedRowData)
  }

  onClickRow(queue, fromPanel) {
    this.selectedRowData = {
      queue: queue,
      fromPanel: fromPanel,
    };
    this.api.search(queue.queueNo).subscribe(resp=>{
      console.log(resp)
    })
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
    let upperDestLs = this.journeyDataSource.data.filter(el => el.actFlag != this.destStatus.WAITING);

    let newDestLs = this.sortChosenSrcLocsByOrder(this.srcLocationDS.data);
    newDestLs = this.transformSrcToDestLoc(newDestLs);
    newDestLs = this.incrementOrderId(newDestLs, this.computeLargestOrderId(upperDestLs) + 1);

    let belowDestLs = this.journeyDataSource.data.filter(el => el.actFlag == this.destStatus.WAITING);
    belowDestLs = this.incrementOrderId(belowDestLs, this.computeLargestOrderId(newDestLs) + 1);

    this.journeyDataSource = new MatTableDataSource<any>([
      ...upperDestLs,
      ...newDestLs,
      ...belowDestLs].sort((a, b) => { return a.orderId - b.orderId }));
    console.log('DEST');
    console.log(this.journeyDataSource.data);
  }

  addToLast() {
    let upperDestLs = this.journeyDataSource.data;

    let newDestLs = this.sortChosenSrcLocsByOrder(this.srcLocationDS.data);
    newDestLs = this.transformSrcToDestLoc(newDestLs);
    newDestLs = this.incrementOrderId(newDestLs, this.computeLargestOrderId(upperDestLs) + 1);

    this.journeyDataSource = new MatTableDataSource<any>([
      ...upperDestLs,
      ...newDestLs].sort((a, b) => { return a.orderId - b.orderId }));
    console.log('DEST');
    console.log(this.journeyDataSource.data);
  }

  onRemove() {
    this.journeyDataSource = new MatTableDataSource(this.journeyDataSource.data.filter(el => el.isSelected == false));
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
  onClickRing() {
    if (this.servingQ) {
      //  all Q highlighted , serving Q exist -> serve serving Q AGAIN
      this.loading = true;
      this.regQS.ringRegAllQ(this.servingQ).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      );
    } else {
      // all Q highlighted , No serving Q -> serve selected Q
      this.loading = true;
      this.regQS.ringRegAllQ(this.selectedRowData.queue).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      );
    }
  }

  onClickSilentRing() {
    if (this.servingQ) {
      //  all Q highlighted , serving Q exist -> serve serving Q AGAIN
      this.loading = true;
      this.regQS.ringRegAllQ(this.servingQ).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      );
    } else {
      // all Q highlighted , No serving Q -> serve selected Q
      this.loading = true;
      this.regQS.ringRegAllQ(this.selectedRowData.queue).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      );
    }
  }

  onClickNext() {
    if (this.servingQ) {
      //  all Q highlighted , serving Q exist -> serve serving Q AGAIN
      this.loading = true;
      this.regQS.ringRegAllQ(this.servingQ).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      );
    } else {
      // all Q highlighted , No serving Q -> serve selected Q
      this.loading = true;
      this.regQS.ringRegAllQ(this.selectedRowData.queue).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      );
    }
  }

  onClickServeAndTransfer() {
    if (this.servingQ) {
      this.loading = true;
      this.regQS.serveAndTransfer(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
    else{
      const dialogData = new ConfirmDialogModel("Warning!", "No serving Q for doing this task!" , false);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData,
        disableClose : true
      });
    }
  }

  addRemark() {
    const dialogRef = this.dialog.open(PopUpWindowComponent, {
      width: '400px',
      data: { queue: this.selectedRowData, remark: false }
    });

    dialogRef.afterClosed().subscribe(res => {
      console.log(res)
      if(res.remark){
        
      }
    });
  }

  onClickNoResponse() {
    if (this.servingQ) {
      this.loading = true;
      this.regQS.regMissQ(this.servingQ).subscribe(
        res => {
          console.log(res);
          this.loading = false;
        }
      )
    } else {
      // this.loading = true;
      // this.regQS.regMissQ(this.selectedRowData.queue).subscribe(
      //   res => {
      //     console.log(res);
      //     this.loading = false;
      //   }
      // )
    }
  }
  ///////////////////////////////////////////
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
