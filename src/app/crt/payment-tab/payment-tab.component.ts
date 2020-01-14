import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { QueueService } from 'src/app/shared/queue.service';
import { SubSink } from 'subsink';
import { QueueStatus } from 'src/app/model/queue-status';
import { SelectionModel } from '@angular/cdk/collections';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';

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
  servingQ: any = null;  //  will always be from allQ


  // Journey list
  journeyListColumns = ['location', 'tick', 'cross']
  journeyListDS = new MatTableDataSource<any>([]);
  jCrossSelection = new SelectionModel<any>(true, []);

  qServingStatus = QueueStatus.SERVING;
  subs = new SubSink();
  constructor(
    private router: Router,
    private qS: QueueService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.subs.add(this.qS._rtAllQs.asObservable().subscribe(Qs => this.allQDS = new MatTableDataSource<any>(Qs)));
    this.subs.add(this.qS._rtHoldQs.asObservable().subscribe(Qs => this.holdQDS = new MatTableDataSource<any>(Qs)));
    this.subs.add(this.qS._rtMissQs.asObservable().subscribe(Qs => this.missQDS = new MatTableDataSource<any>(Qs)));

    this.subs.add(this.qS._servingQ.asObservable().subscribe(Q => {
      this.servingQ = Q;
      this.journeyListDS = new MatTableDataSource<any>(this.servingQ.planList);
    }));
  }

  onClickRing() {
    switch (this.selectedRowData.fromPanel) {
      case 'all': {
        if (this.servingQ.queueNo) {
          //  all Q highlighted , serving Q exist -> serve serving Q AGAIN
          this.qS.ringAllQ(this.servingQ).subscribe(
            res => {
              console.log(res);
            }
          );
        } else {
          // all Q highlighted , No serving Q -> serve selected Q
          this.qS.ringAllQ(this.selectedRowData.queue).subscribe(
            res => {
              console.log(res);
            }
          );
        }
        break;
      }
      case 'hold': {
        if (this.servingQ.queueNo) {
          //  hold Q hightlighted , serving Q exist -> do nothing
          return;
        } else {
          //  hold Q hightlighted , No serving Q -> serve selected hold Q 

        }
        break;
      }
      case 'miss': {
        if (this.servingQ.queueNo) {
          //  miss Q hightlighted , serving Q exist -> do nothing
          return;
        } else {
          //  miss Q hightlighted , No serving Q -> serve selected miss Q 

        }
        break;
      }
    }
  }

  onClickHold() {
    console.log(this.jCrossSelection);
  }

  onClickExit() {
    const message = `Are you sure you want to do this?`;

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

  onClickAddServicePoint() {
    // this.dialog.open(AddServicePointComponent, {
    //   width: '80vw',
    //   data: this.servingQ,
    // });
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
