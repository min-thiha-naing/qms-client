import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { QTableRowData } from 'src/app/model/queue.model';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { SubSink } from 'subsink';
import { QueueStatus, DestinationStatus } from 'src/app/model/queue-status';
import { SelectionModel } from '@angular/cdk/collections';
import { AddServicePointComponent } from '../add-service-point/add-service-point.component';
import { Helper } from 'src/app/shared/helper.class';
import { RoomModuleService } from 'src/app/shared/room-module.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-room-module-tab',
  templateUrl: './room-module-tab.component.html',
  styleUrls: ['./room-module-tab.component.scss']
})
export class RoomModuleTabComponent implements OnInit, OnDestroy {

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
    private qS: RoomModuleService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {

    this.qS.getAllQ();
    this.qS.getHoldQ();
    this.qS.getMissQ();

    this.subs.add(this.qS.allQs.subscribe(Qs => {
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
    this.subs.add(this.qS.holdQs.subscribe(Qs => this.holdQDS = new MatTableDataSource<any>(Qs)));
    this.subs.add(this.qS.missQs.subscribe(Qs => this.missQDS = new MatTableDataSource<any>(Qs)));

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

    //  Search
    this.subs.add(this.qS.searchResultFoundFrontend.subscribe(res => this.selectedRowData = res));
    this.subs.add(this.qS.searchResultFoundBackend.subscribe(res => ))
  }

  onClickRing() {
    switch (this.selectedRowData.fromPanel) {
    // switch (this.selectedRowData.value.fromPanel) {
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
    let dialogRef = this.dialog.open(AddServicePointComponent, {
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
    // this.selectedRowData.next({
    //   queue: queue,
    //   fromPanel: fromPanel,
    // });
    console.log(this.selectedRowData)
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
