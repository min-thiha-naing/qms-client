import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { QTableRowData } from 'src/app/model/queue.model';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { QueueService } from 'src/app/shared/queue.service';
import { SubSink } from 'subsink';
import { QueueStatus } from 'src/app/model/queue-status';
import { SelectionModel } from '@angular/cdk/collections';
import { AddServicePointComponent } from '../add-service-point/add-service-point.component';

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
  jCrossSelection = new SelectionModel<any>(true,[]);

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
          this.qS.serveQ(this.servingQ).subscribe(
            res => {
              console.log(res);
            }
          );
        } else {
          this.qS.serveQ(this.selectedRowData.queue).subscribe(
            res => {
              console.log(res);
            }
          );
        }
        break;
      }
      case 'hold': {
        break;
      }
      case 'miss': {
        break;
      }
    }
  }

  onClickHold(){
    console.log(this.jCrossSelection);
  }

  onClickAddServicePoint() {
    this.dialog.open(AddServicePointComponent,{
      width: '70vw'
    });
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
