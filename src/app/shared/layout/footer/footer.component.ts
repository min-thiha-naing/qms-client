import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Helper } from '../../helper.class';
import { MatDialog } from '@angular/material';
import { CrtSearchDialogComponent } from 'src/app/crt/crt-search-dialog/crt-search-dialog.component';
import { RtSearchDialogComponent, DialogModel } from 'src/app/rt/rt-search-dialog/rt-search-dialog.component';

import { QueueService } from '../../queue.service';
import { RoomModuleService } from '../../room-module.service';
import { ApiService } from '../../api.service';
import { SubSink } from 'subsink';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { RoomModuleTabComponent } from 'src/app/rt/room-module-tab/room-module-tab.component';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  subs = new SubSink();
  searchValue: string = '';
  tab: any;
  searchRes: any;
  servingQ: any = null;
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private rtService: RoomModuleService,
    private api: ApiService,
    private RMT: RoomModuleTabComponent

  ) { }

  ngOnInit() {
    if (this.router.url === '/rt') {
      console.log('rt')
      console.log(Helper.onTabIndexChanged)
      this.subs.add(this.rtService.servingQ.subscribe(Q => {
        this.servingQ = Q
      }))
    } else {
      console.log('crt')
      console.log(Helper.onTabIndexChanged)
    }
  }

  onSearch() {
    if (this.servingQ) {
      const dialogData = new ConfirmDialogModel("Warning!", "You cannot access this function because of existing serving Q.", false);
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData,
        disableClose: true
      });
      return false
    }
    if (this.router.url === '/rt') {
      this.tab = Helper.onTabIndexChanged
      if (this.tab == 0) {
        this.rtService.searchAllQ(this.searchValue).subscribe(resp => {
          this.searchRes = resp;
        })
        if (this.searchRes.value.queue) {
          Helper.setSearch(true);
          console.log(this.searchRes)
          // this.RMT.setRow(this.searchRes);
        } else {
          Helper.setSearch(false);
          this.rtService.searchHoldQ(this.searchValue).subscribe(resp => {
            this.searchRes = resp;
          })
          if (this.searchRes.value.queue) {
            Helper.setSearch(true);
            console.log(this.searchRes)
            // this.RMT.setRow(this.searchRes);
          } else {
            Helper.setSearch(false);
            this.rtService.searchMissQ(this.searchValue).subscribe(resp => {
              this.searchRes = resp;
            })
            if (this.searchRes.value.queue) {
              Helper.setSearch(true);
              console.log(this.searchRes)
              // this.RMT.setRow(this.searchRes);
            } else {
              Helper.setSearch(false);
              this.api.search(this.searchValue).subscribe(resp => {
                this.searchRes = resp
                console.log(this.searchRes)
                if (this.searchRes.liveTransactionQueue != null && this.searchRes.liveAppointmentPatient != null) {
                  const dialogData = new DialogModel(this.searchRes);
                  const dialogRef = this.dialog.open(RtSearchDialogComponent, {
                    maxWidth: "600px",
                    data: dialogData,
                    disableClose: true
                  });

                  dialogRef.afterClosed().subscribe(dialogResult => {
                    console.log(dialogResult);
                  });
                } else {
                  console.log('Not fond')
                }
              })
            }
          }
        }
      }
    } else {

    }
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
