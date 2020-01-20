import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-rt-search-dialog',
  templateUrl: './rt-search-dialog.component.html',
  styleUrls: ['./rt-search-dialog.component.scss']
})
export class RtSearchDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<RtSearchDialogComponent>) { }

  ngOnInit() {
  }

  onCancel(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}
