import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-pop-up-window',
  templateUrl: './pop-up-window.component.html',
  styleUrls: ['./pop-up-window.component.scss']
})

export class PopUpWindowComponent implements OnInit {

  
  constructor(
    public dialogRef: MatDialogRef<PopUpWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { dialogRef.disableClose = true;}

  onNoClick() {
    this.data.remark = false
    this.dialogRef.close(this.data);
  }

  onClick(){
    this.data.remark = true
    this.dialogRef.close(this.data);
  }

  ngOnInit() {
    console.log(this.data)
  }
}

export interface DialogData {
 queue:any;
 remark:boolean;
}
