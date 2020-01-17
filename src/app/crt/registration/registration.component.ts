import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource, MatTable, MatDialog } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { QueueService } from 'src/app/shared/queue.service';
import { QueueStatus } from 'src/app/model/queue-status';
import { TransformerService } from 'src/app/shared/transformer.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  queueDisplayedColumns: string[] = ['qNo', 'name', 'mrn', 'visitType', 'apptTime', 'waitTime', 'tWaitTime', 'callTime', 'remarks'];
  queueSelection = new SelectionModel<any>(true, []);

  locationDisplayedColumns: string[] = ['select', 'location', 'inQ', 'order'];
  locationDataSource: MatTableDataSource<Location>;
  locationSelection = new SelectionModel<Location>(true, []);
  @ViewChild('journeyTable', { static: true }) journeyTable: MatTable<any>;
  journeyDisplayedColumns: string[] = ['select', 'clinic', 'location', 'apptTime', 'createdBy', 'status'];
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
  constructor(
    private qS: QueueService,
    private transform: TransformerService,
    private dialog: MatDialog,
  ) { }
  ngOnInit() {
    this.qS.getRegAllQ();
    
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

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
