import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SearchDialogModel } from 'src/app/model/search-dialog.model';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { QueueStatus } from 'src/app/model/queue-status';

@Component({
  selector: 'app-rt-search-dialog',
  templateUrl: './rt-search-dialog.component.html',
  styleUrls: ['./rt-search-dialog.component.scss']
})
export class RtSearchDialogComponent implements OnInit {
  searchObj: SearchDialogModel
  searchForm: FormGroup
  miss = false;
  wait = false;
  serve = false;
  hold = false;
  close = false;
  fresh = false;
  missback = false;
  revert = false;
  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<RtSearchDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogModel) { }

  ngOnInit() {
    console.log(this.data)
    this.searchForm = this.fb.group({
      QNO: [this.data.Sval.liveTransactionQueue.queueNo],
      ICFIN: [this.data.Sval.liveAppointmentPatient.patientNric],
      name: [this.data.Sval.liveAppointmentPatient.patientName],
      title: [this.data.Sval.liveAppointmentPatient.patientTitle],
      status: [null],
    })

    if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.WAITING) {
      this.wait = true;
      this.searchForm.controls['status'].patchValue("Waiting");
    } else if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.SERVING) {
      this.serve = true;
      this.searchForm.controls['status'].patchValue("Serving")
    } else if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.MISS) {
      this.miss = true;
      this.searchForm.controls['status'].patchValue("Miss Call")
    } else if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.MISSBACK) {
      this.missback = true;
      this.searchForm.controls['status'].patchValue("Miss Back")
    } else if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.FRESH) {
      this.fresh = true;
      this.searchForm.controls['status'].patchValue("Fresh")
    } else if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.HOLD) {
      this.hold = true;
      this.searchForm.controls['status'].patchValue("Hold")
    } else if (this.data.Sval.liveTransactionQueue.queueStatusId == QueueStatus.CLOSED) {
      this.close = true;
      this.searchForm.controls['status'].patchValue("Closed")
    } else {
      this.revert = true;
      this.searchForm.controls['status'].patchValue("Revert")
    }
  }

  onCancel(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}
export class DialogModel {
  constructor(public Sval: any) {
  }
}