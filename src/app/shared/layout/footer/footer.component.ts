import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Helper } from '../../helper.class';
import { MatDialog } from '@angular/material';
import { CrtSearchDialogComponent } from 'src/app/crt/crt-search-dialog/crt-search-dialog.component';
import { RtSearchDialogComponent, DialogModel } from 'src/app/rt/rt-search-dialog/rt-search-dialog.component';

import { RoomModuleService } from '../../room-module.service';
import { ApiService } from '../../api.service';
import { SubSink } from 'subsink';
import { ConfirmDialogModel, ConfirmDialogComponent } from 'src/app/confirm-dialog/confirm-dialog.component';
import { RoomModuleTabComponent } from 'src/app/rt/room-module-tab/room-module-tab.component';
import { MessengerService, Tabs } from '../../messenger.service';
import { RegistartionService } from '../../registartion.service';
import { PaymentTabService } from '../../payment-tab.service';
import { AppointmentService } from '../../appointment.service';

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
  constructor(
    private router: Router,
    private dialog: MatDialog,
    private rMS: RoomModuleService,
    private api: ApiService,
    private messenger: MessengerService,
    private regService: RegistartionService,
    private pMService: PaymentTabService,
    private APService: AppointmentService
  ) { }

  ngOnInit() {
  }

  onSearch() {
    if (this.messenger.isThereServingQ()) {
      const dialogData = new ConfirmDialogModel("Warning!", "You cannot access this function because of existing serving Q.", false);
      this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData,
        disableClose: true
      });
      return;
    } else {

      let localSearchResult;
      let localAppointment;
      let currentDir = this.messenger.getCurrentDirectory();

      // NOTE  Search from suitable service according to currentDir
      switch (currentDir) {
        case Tabs.ROOM_MODULE: {
          localSearchResult = this.rMS.search(this.searchValue);
          break;
        }
        case Tabs.PAYMENT_TAB: {
          localSearchResult = this.pMService.search(this.searchValue);
          break;
        }
        case Tabs.REGISTRATION_MODULE: {
          localSearchResult = this.regService.search(this.searchValue);
          break;
        }
        case Tabs.RTAP_TAP: {
          localAppointment = this.APService.search(this.searchValue);
          break;
        }
        case Tabs.CRTAP_TAP: {
          localAppointment = this.APService.search(this.searchValue);
          break;
        }
      }
      if (localAppointment) {
        this.messenger.emitAppointmentSearchResult(localAppointment);
      } else
        if (localSearchResult) {
          //  if search result found in frontend
          this.messenger.emitSearchResultFoundFrontend(localSearchResult);
        } else {
          this.api.search(this.searchValue).subscribe(resp => {
            this.searchRes = resp;
            if (this.searchRes.liveTransactionQueue != null && this.searchRes.liveAppointmentPatient != null) {
              const dialogData = new DialogModel(this.searchRes);
              const dialogRef = this.dialog.open(RtSearchDialogComponent, {
                maxWidth: "600px",
                data: dialogData,
                disableClose: true
              });
              dialogRef.afterClosed().subscribe(dialogResult => {
              });
            } else {
              const dialogData = new ConfirmDialogModel("No Q Found!", '', false);
              this.dialog.open(ConfirmDialogComponent, {
                maxWidth: "400px",
                data: dialogData,
                disableClose: true
              });
            }

          });
        }
    }
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
