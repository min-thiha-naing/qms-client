import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { ApiService } from 'src/app/shared/api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { SelectionModel } from '@angular/cdk/collections';
import { map } from 'rxjs/operators';



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

  destStatus = {
    CLOSED: 'Closed',
    SERVING: 'Serving',
    WAITING: 'Waiting',
  };

  constructor(
    private dialogRef: MatDialogRef<AddServicePointComponent>,
    @Inject(MAT_DIALOG_DATA) public servingQ: { planList: any[] },
    private api: ApiService,
  ) { }

  ngOnInit() {
    console.log(this.servingQ)
    this.api.getDepartments().subscribe(resp => this.departments = resp);

    this.destLocationDS = new MatTableDataSource<any>(this.transformPlanListToDestLocList(this.servingQ.planList));
    console.log(this.destLocationDS.data);
  }


  onDeselectAll() { 
    this.srcLocationDS.data.forEach(el=> {
      el.isSelected=false;
      el.orderId=null;
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

  transformWGtoSrcLoc(wg: any) {
    return {
      ...wg,
      workgroupId: wg.id,
      isSelected: false,
      orderId: null,
    };
  }

  transformPlanListToDestLocList(planlist: any[]) {
    return planlist.map((element, index) => {
      let destStatus;
      if (element.flag == 1) {
        destStatus = this.destStatus.CLOSED;
      } else if (element.flag == 0) {
        if (planlist[index - 1].flag == 1) {
          destStatus = this.destStatus.SERVING;
        } else {
          destStatus = this.destStatus.WAITING;
        }
      }

      return {
        ...element,
        destStatus: destStatus,
        isSelected: false,
      }
    })
  }

  transformSrcToDestLoc(srcLocs: any[], startingOrderId: number) {
    // make sure src is already sorted
    return srcLocs.map(el => {
      return {
        ...el,
        orderId: startingOrderId++,
        destStatus: this.destStatus.WAITING,
        isSelected: false,
      }
    })
  }

  sortSrcLocsByOrder(srcLocs: any[]) {
    return srcLocs
      .filter(el => el.isSelected == true)
      .sort((a, b) => {
        return a.orderId - b.orderId;
      })
  }

  addToFirst() {
    let newDestLs = this.transformSrcToDestLoc(this.sortSrcLocsByOrder(this.srcLocationDS.data), this.findoutStartingOrderId(this.destLocationDS.data));
    let startOrderId = Math.max(...newDestLs.map(el => el.orderId)) + 1;
    let belowDests = this.destLocationDS.data.filter(el => el.destStatus == this.destStatus.WAITING)
      .map(el => {
        return {
          ...el,
          orderId: startOrderId++,
        }
      });
    this.destLocationDS = new MatTableDataSource<any>([
      ...this.getDestLocsByDestStatus(this.destLocationDS.data, this.destStatus.CLOSED),
      ...this.getDestLocsByDestStatus(this.destLocationDS.data, this.destStatus.SERVING),
      ...newDestLs, 
      ...belowDests].sort((a, b) => { return a.orderId - b.orderId }));
  }

  addToLast() {
    let startOrderId = Math.max(...this.destLocationDS.data.map(el => el.orderId)) +1;
    let newDestLs = this.transformSrcToDestLoc(this.sortSrcLocsByOrder(this.srcLocationDS.data), startOrderId);
    this.destLocationDS = new MatTableDataSource<any>([...this.destLocationDS.data, ...newDestLs].sort((a, b) => { return a.orderId - b.orderId }));
  }

  findoutStartingOrderId(destLocs: any[]): number {
    return destLocs.find(el => el.destStatus == this.destStatus.SERVING).orderId + 1;
  }


  onChangeDepartment(ev) {
    this.api.getWorkgroupsByDpt(ev.target.value)
      .pipe(map(resp => {
        return resp.map(element => this.transformWGtoSrcLoc(element))
      }))
      .subscribe(resp => this.srcLocationDS = new MatTableDataSource(resp));
  }

  getDestLocsByDestStatus(destLocs: any[], status: any){
    return destLocs.filter(el=>el.destStatus == status);
  }

  onConfirm() {
    this.dialogRef.close();
  }
}
