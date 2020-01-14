import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { QueueService } from 'src/app/shared/queue.service';
import { SubSink } from 'subsink';
import { QueueStatus } from 'src/app/model/queue-status';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { TransformerService } from 'src/app/shared/transformer.service';
import { AddServicePointComponent } from 'src/app/rt/add-service-point/add-service-point.component';

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

  selectedRowData = {
    queue: {
      queueNo: null
    },
    fromPanel: ''
  };

  allQTableHeader = {
    total: 0,
    fresh: 0,
    revert: 0,
    missback: 0,
    waiting: 0,
  }

  servingQ: any = null;  //  will always be from allQ


  // Journey list
  journeyListColumns = ['location', 'tick', 'cross']
  journeyListDS = new MatTableDataSource<any>([]);
  jCrossSelection = new SelectionModel<any>(true, []);

  qServingStatus = QueueStatus.SERVING;
  subs = new SubSink();
  loading = false;
  constructor(
    private router: Router,
    private qS: QueueService,
    private dialog: MatDialog,
    private transform: TransformerService
  ) { }

  ngOnInit() {
    this.subs.add(this.qS.crtAllQs.subscribe(Qs => {
      this.allQDS = new MatTableDataSource<any>(Qs);

      this.allQTableHeader = {
        total: Qs.length,
        fresh: Qs.filter(el => el.queueStatusId == QueueStatus.FRESH).length,
        revert: Qs.filter(el => el.queueStatusId == QueueStatus.REVERT).length,
        missback: Qs.filter(el => el.queueStatusId == QueueStatus.MISSBACK).length,
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
    this.subs.add(this.qS._crtHoldQs.asObservable().subscribe(Qs => this.holdQDS = new MatTableDataSource<any>(Qs)));
    this.subs.add(this.qS._crtMissQs.asObservable().subscribe(Qs => this.missQDS = new MatTableDataSource<any>(Qs)));

    this.subs.add(this.qS._servingQ.asObservable().subscribe(Q => {
      this.servingQ = Q;
      if (this.servingQ) {
        if (this.servingQ.planList) {
          console.log(this.transform.planListToDestLocList(this.servingQ.planList));
          this.journeyListDS = new MatTableDataSource<any>(this.transform.planListToDestLocList(this.servingQ.planList));
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
    switch (this.selectedRowData.fromPanel) {
      case 'all': {
        if (this.servingQ) {
          //  all Q highlighted , serving Q exist -> serve serving Q AGAIN
          this.loading = true;
          this.qS.ringCrtAllQ(this.servingQ).subscribe(
            res => {
              console.log(res);
              this.loading = false;
            }
          );
        } else {
          // all Q highlighted , No serving Q -> serve selected Q
          this.loading = true;
          this.qS.ringCrtAllQ(this.selectedRowData.queue).subscribe(
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
          this.qS.ringCrtHoldQ(this.selectedRowData.queue).subscribe(
            res => {
              console.log(res);
              this.loading = false;
            }
          );
        }
        break;
      }
      case 'miss': {
        if (this.servingQ) {
          //  miss Q hightlighted , serving Q exist -> do nothing
          return;
        } else {
          //  miss Q hightlighted , No serving Q -> serve selected miss Q 
          this.loading = true;
          this.qS.ringCrtMissQ(this.selectedRowData.queue).subscribe(
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

  onClickExit() {
    const message = `Are you sure you want to do this? The queue will be terminated and cannot be revived!`;

    const dialogData = new ConfirmDialogModel("Confirm Action", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(dialogResult => {
      console.log(dialogResult);
    });
  }

  onClickNoResp() {
    if (this.servingQ) {
      this.loading = true;
      this.qS.crtMissQ(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
  }

  onClickHold() {
    if (this.servingQ) {
      this.loading = true;
      this.qS.crtHoldQ(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
  }

  serveAndTransfer() {
    if (this.servingQ) {
      this.loading = true;
      this.qS.crtServeAndTransfer(this.servingQ).subscribe(
        res => {
          this.loading = false;
        }
      )
    }
  }

  onClickAddServicePoint() {
    let dialogRef = this.dialog.open(AddServicePointComponent, {
      width: '80vw',
      data: this.servingQ,
    });

    this.subs.add(dialogRef.afterClosed().subscribe(result => {
      if (result && result.role == 'confirm' && result.data.length > 0) {
        console.log('GOT');
        console.log(result.data);
        this.qS.crtAddServicePoint({
          id: this.servingQ.id,
          visitId: this.servingQ.visitId,
          planList: result.data,
        }).subscribe()
      }
    }));
  }

  onClickRow(queue, fromPanel) {
    this.selectedRowData = {
      queue: queue,
      fromPanel: fromPanel,
    };
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
