import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { ApiService } from 'src/app/shared/api.service';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-add-service-point',
  templateUrl: './add-service-point.component.html',
  styleUrls: ['./add-service-point.component.scss']
})
export class AddServicePointComponent implements OnInit {

  departments: any[] = [];
  srcLocationDS = new MatTableDataSource<any>([]); 
  destLocationDS = new MatTableDataSource<any>([]); 

  constructor(
    private dialogRef: MatDialogRef<AddServicePointComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private api: ApiService,
  ) { }

  ngOnInit() {
    this.api.getDepartments().subscribe(resp => this.departments = resp);
  }

  

  onConfirm(){
    this.dialogRef.close();
  }
  

  onChangeDepartment(ev){
    this.api.getWorkgroupsByDpt(ev.target.value).subscribe(resp => this.srcLocationDS = new MatTableDataSource(resp));
  }
}
