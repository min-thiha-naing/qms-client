import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { ApiService } from 'src/app/shared/api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DestinationStatus } from 'src/app/model/queue-status';



@Component({
  selector: 'app-add-service-point',
  templateUrl: './add-service-point.component.html',
  styleUrls: ['./add-service-point.component.scss']
})
export class AddServicePointComponent implements OnInit {

  departments: any[] = [];

  //  source - left side table
  srcLocationDS = new MatTableDataSource<any>([]);
  srcColumns = ['location', 'inQ', 'select', 'orderId'];


  //  destination - right side table
  destLocationDS = new MatTableDataSource<any>([]);
  upcomingDests = new BehaviorSubject<any[]>([]);
  destColumns = ['clinic', 'location', 'apptTime', 'status', 'select']

  destStatus = DestinationStatus;

  constructor(
    private dialogRef: MatDialogRef<AddServicePointComponent>,
    @Inject(MAT_DIALOG_DATA) public servingQ: any,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.api.getDepartments().subscribe(resp => this.departments = resp);

    this.destLocationDS = new MatTableDataSource<any>(this.transformPlanListToDestLocList(this.servingQ.planList));
    console.log('DEST');
    console.log(this.destLocationDS.data);
  }


  onDeselectAll() {
    this.srcLocationDS.data.forEach(el => {
      el.isSelected = false;
      el.orderId = null;
    })
  }

  onToggleSrcLoc(srcEl) {
    //  auto increment orderId
    if (srcEl.isSelected) {
      srcEl.orderId = Math.max(...(this.srcLocationDS.data.filter(el => el.isSelected == true).map(el => el.orderId))) + 1;
    } else {
      srcEl.orderId = null;
    }
  }

  transformPlanListToDestLocList(planList) {
    return planList.map((element, index) => {
      return {
        ...element,
        isSelected: false,
      }
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

  sortChosenSrcLocsByOrder(srcLocs: any[]) {
    return srcLocs
      .filter(el => el.isSelected == true)
      .sort((a, b) => {
        return a.orderId - b.orderId;
      })
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

  onRevert() {
    var currDestClone = { ...this.destLocationDS.data.find(el => el.actFlag == this.destStatus.SERVING), id: null };
    currDestClone.orderId = Math.max(...this.destLocationDS.data.map(el => el.orderId)) + 1;
    currDestClone.actFlag = this.destStatus.WAITING;
    this.destLocationDS = new MatTableDataSource<any>([...this.destLocationDS.data, currDestClone]);
  }

  computeLargestOrderId(list: any[]): number {
    return Math.max(...list.map(el => el.orderId));
  }

  incrementOrderId(list: any[], startingOrderId: number) {
    return list.map(el => { return { ...el, orderId: startingOrderId++ } });
  }


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

  getDestLocsByActFlag(destLocs: any[], status: any) {
    return destLocs.filter(el => el.actFlag == status);
  }

  onConfirm() {
    this.dialogRef.close({
      data: {
        id: this.servingQ.id,
        visitId: this.servingQ.visitId,
        planList: [...this.destLocationDS.data.filter(loc => loc.actFlag == this.destStatus.WAITING)
          .map(loc => {
            return {
              ...loc,
              id: null,
              visitId: this.servingQ.visitId,
              isSelected: false,
            }
          })]
      },
      role: 'confirm',
    }
    );
  }
}
