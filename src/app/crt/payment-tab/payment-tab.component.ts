import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { QueueService } from 'src/app/shared/queue.service';
import { SubSink } from 'subsink';
import { QueueStatus, DestinationStatus } from 'src/app/model/queue-status';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { TransformerService } from 'src/app/shared/transformer.service';
import { AddServicePointComponent } from 'src/app/rt/add-service-point/add-service-point.component';
import { Helper } from 'src/app/shared/helper.class';
import { ServicePointComponent } from '../service-point/service-point.component';

@Component({
  selector: 'app-payment-tab',
  templateUrl: './payment-tab.component.html',
  styleUrls: ['./payment-tab.component.scss']
})
export class PaymentTabComponent implements OnInit {

  qTableColumns = ['qNo', 'name', 'mrn', 'visitType', 'apptTime', 'waitTime', 'tWaitTime', 'callTime', 'remark'];
  allQDS = new MatTableDataSource<any>([]);
  holdQDS = new MatTableDataSource<any>([]);
  missQDS = new MatTableDataSource<any>([]);

  allQTableHeader = {
    total: 0,
    fresh: 0,
    revert: 0,
    missback: 0,
    waiting: 0,
  }

  selectedRowData = {
    queue: {
      queueNo: null
    },
    fromPanel: ''
  };
  servingQ: any = null;  //  will always be from allQ


  // Journey list
  journeyListColumns = ['location', 'tick', 'cross']
  journeyListDS = new MatTableDataSource<any>([]);

  qServingStatus = QueueStatus.SERVING;
  destStatus = DestinationStatus;
  subs = new SubSink();
  loading = false;
  constructor(
    private qS: QueueService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.qS.getCrtAllQ();
    this.qS.getCrtHoldQ();
    this.qS.getCrtMissQ();

    this.subs.add(this.qS.rtAllQs.subscribe(Qs => {
      this.allQDS = new MatTableDataSource<any>(Qs);

      if (Qs) {
        this.allQTableHeader = {
          total: Qs.length,
          fresh: Qs.filter(el => el.queueStatusId == QueueStatus.FRESH).length,
          revert: Qs.filter(el => el.queueStatusId == QueueStatus.REVERT).length,
          missback: Qs.filter(el => el.queueStatusId == QueueStatus.MISSBACK).length,
          waiting: Qs.filter(el => el.queueStatusId == QueueStatus.WAITING).length,
        };

        if (this.allQDS.data[0]) {
          this.selectedRowData = {
            queue: {
              queueNo: this.allQDS.data[0].queueNo,
              ...this.allQDS.data[0],
            },
            fromPanel: 'all'
          }
        }
      }
    }));
    this.subs.add(this.qS._rtHoldQs.asObservable().subscribe(Qs => this.holdQDS = new MatTableDataSource<any>(Qs)));
    this.subs.add(this.qS._rtMissQs.asObservable().subscribe(Qs => this.missQDS = new MatTableDataSource<any>(Qs)));

    this.subs.add(this.qS.servingQ.subscribe(Q => {
      this.servingQ = Q;
      if (this.servingQ) {
        if (this.servingQ.planList) {
          this.journeyListDS = new MatTableDataSource<any>(Helper.transformPlanListToDestLocList(this.servingQ.planList));
        } else {
          this.journeyListDS = new MatTableDataSource<any>()
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
  }

  onClickRing() {
    console.log(this.selectedRowData)
    switch (this.selectedRowData.fromPanel) {
      case 'all': {
        if (this.servingQ) {
          //  all Q highlighted , serving Q exist -> serve serving Q AGAIN
          this.loading = true;
          this.qS.ringAllQ(this.servingQ).subscribe(
            res => {
              console.log(res);
              this.loading = false;
            }
          );
        } else {
          // all Q highlighted , No serving Q -> serve selected Q
          this.loading = true;
          this.qS.ringAllQ(this.selectedRowData.queue).subscribe(
            res => {
              console.log(res);
              this.loading = false;
            }
          );
        }
        break;
      }
      case 'hold': {
        if (this.servingQ) {
          //  hold Q hightlighted , serving Q exist -> do nothing
          return;
        } else {
          //  hold Q hightlighted , No serving Q -> serve selected hold Q 
          this.loading = true;
          this.qS.ringHoldQ(this.selectedRowData.queue).subscribe(
            res => {
              console.log(res);
              this.loading = false;
            }
          );
        }
        break;
      }
      case 'miss': {
        console.log(this.servingQ)
        if (this.servingQ) {
          //  miss Q hightlighted , serving Q exist -> do nothing
          return;
        } else {
          //  miss Q hightlighted , No serving Q -> serve selected miss Q 
          this.loading = true;
          this.qS.ringMissQ(this.selectedRowData.queue).subscribe(
            res => {
              console.log(res);
              this.loading = false;
            }
          );
        }
        break;
      }
    }
  }

  onClickNoResp() {
    if (this.servingQ) {
      this.loading = true;
      this.qS.missQ(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
  }

  onClickHold() {
    if (this.servingQ) {
      this.loading = true;
      this.qS.holdQ(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
  }

  serveAndTransfer() {
    if (this.servingQ) {
      this.loading = true;
      this.qS.serveAndTransfer(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
  }

  onClickAddServicePoint() {
    let dialogRef = this.dialog.open(ServicePointComponent, {
      width: '80vw',
      data: this.servingQ,
    });

    this.subs.add(dialogRef.afterClosed().subscribe(result => {
      if (result && result.role == 'confirm' && result.data.planList.length > 0) {
        console.log('GOT');
        console.log(result.data);
        this.qS.addServicePoint(result.data).subscribe()
      }
    }));
  }

  onRemoveJourneyList() {
    var orderIdListToDel = this.journeyListDS.data.filter(el => el.isSelected).map(el => el.orderId);
    console.log(orderIdListToDel);
    if (orderIdListToDel.length > 0) {
      this.qS.deletePlanList(this.servingQ, orderIdListToDel).subscribe();
    }
  }

  onClickRow(queue, fromPanel) {
    this.selectedRowData = {
      queue: queue,
      fromPanel: fromPanel,
    };
  }

  onClickExit() {
    const message = `Are you sure you want to do this?`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
      disableClose : true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      console.log(dialogResult);
    });
}

ngOnDestroy() {
  this.subs.unsubscribe();
}
}
