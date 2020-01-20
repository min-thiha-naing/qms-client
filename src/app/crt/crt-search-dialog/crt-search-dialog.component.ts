import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-crt-search-dialog',
  templateUrl: './crt-search-dialog.component.html',
  styleUrls: ['./crt-search-dialog.component.scss']
})
export class CrtSearchDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<CrtSearchDialogComponent>) { }

  ngOnInit() {
  }

  onCancel(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }
}
