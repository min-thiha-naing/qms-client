import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ApiService } from '../shared/api.service';
import { RegistartionService } from '../shared/registartion.service';

@Component({
  selector: 'app-pop-up-window',
  templateUrl: './pop-up-window.component.html',
  styleUrls: ['./pop-up-window.component.scss']
})

export class PopUpWindowComponent implements OnInit {
  remark: any = ''

  constructor(
    private regService: RegistartionService,
    public dialogRef: MatDialogRef<PopUpWindowComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { dialogRef.disableClose = true; }


  ngOnInit() {
    console.log(this.data)
  }

  onNoClick() {
    this.data.remark = false
    this.dialogRef.close();
  }

  onClick(){
    this.data.remark = true
    var dummy = {
      "terminalId": sessionStorage.getItem('terminalId'),
      "transactionId": this.data.queue.queue.id,
      "remark": this.remark,
      "remarkTime": new Date().toISOString(),
      "visitid": this.data.queue.queue.visitId,
      "remarkType": 1
    }
    this.data.queue.queue.remark = this.remark;
    this.regService.remark(this.data.queue.queue, dummy)
      .subscribe(resp => {
        console.log(resp)
      })
    this.dialogRef.close(this.data);
  }


}

export interface DialogData {
  queue:any;
  remark:boolean;
}
