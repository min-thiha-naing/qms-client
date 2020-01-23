import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Helper } from '../../helper.class';
import { MatDialog } from '@angular/material';
import { CrtSearchDialogComponent } from 'src/app/crt/crt-search-dialog/crt-search-dialog.component';
import { RtSearchDialogComponent } from 'src/app/rt/rt-search-dialog/rt-search-dialog.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  searchValue: string = '';
  constructor(
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    if (this.router.url === '/rt') {
      console.log('rt')
      console.log(Helper.onTabIndexChanged)
    } else {
      console.log('crt')
      console.log(Helper.onTabIndexChanged)
    }
  }

  onSearch() {
    if (this.router.url === '/rt') {
      console.log(Helper.onTabIndexChanged)
      const dialogRef = this.dialog.open(RtSearchDialogComponent, {
        maxWidth: "600px",
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        console.log(dialogResult);
      });
    }
    else {
      console.log(Helper.onTabIndexChanged)
      const dialogRef = this.dialog.open(CrtSearchDialogComponent, {
        maxWidth: "600px",
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(dialogResult => {
        console.log(dialogResult);
      });
    }
  }
}
