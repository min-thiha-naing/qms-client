import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent implements OnInit {
  title: string;
  message: string;
  show = true;
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogModel) {
    dialogRef.disableClose = true;
    // Update view with given values
    this.title = data.title;
    this.message = data.message;
  }

  ngOnInit() {
    if (this.data.confirm) {
      this.show = true
    }else{
      this.show = false
    }
  }

  onConfirm(): void {
    // Close the dialog, return true
    this.dialogRef.close(true);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
}
export class ConfirmDialogModel {

  constructor(public title: string, public message: string, public confirm: boolean) {
  }
}