import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { ApiService } from 'src/app/shared/api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { DestinationStatus } from 'src/app/model/queue-status';
import { ServicePointEditor } from 'src/app/shared/service-point-editor';



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
  destColumns = ['clinic', 'location', 'apptTime', 'status', 'select']


  servicePointEditor = new ServicePointEditor();

  destStatus = DestinationStatus;

  constructor(
    private dialogRef: MatDialogRef<AddServicePointComponent>,
    @Inject(MAT_DIALOG_DATA) public servingQ: any,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.api.getDepartments().subscribe(resp => this.departments = resp);

    this.servicePointEditor.setDestLocationDS(this.servingQ.planList);

  }

  addToFirst() {
    this.servicePointEditor.addToFirst();
  }

  addToLast() {
    this.servicePointEditor.addToLast();
  }

  onRevert() {
    this.servicePointEditor.onRevert();
  }

  onRemove() {
    this.servicePointEditor.onRemove();
  }

  onToggleSrcLoc(el){
    this.servicePointEditor.onToggleSrcLoc(el);
  }

  onChangeDepartment(ev) {
    this.api.getWorkgroupsByDpt(ev.target.value)
      .subscribe(resp => {
        this.servicePointEditor.setSrcLocationDS(resp);
      });
  }

  onConfirm() {
    this.dialogRef.close({
      data: this.servicePointEditor.getApiReqPayload(this.servingQ),
      role: 'confirm',
    }
    );
  }
}
