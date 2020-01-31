import { Component, OnInit, ViewChild } from '@angular/core';
import { Helper } from '../shared/helper.class';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { SubSink } from 'subsink';
import { SocketClientService } from '../socket-client.service';
import { Router } from '@angular/router';
import { MessengerService, Tabs } from '../shared/messenger.service';
import { RegistartionService } from '../shared/registartion.service';
import { PaymentTabService } from '../shared/payment-tab.service';

@Component({
  selector: 'app-crt',
  templateUrl: './crt.component.html',
  styleUrls: ['./crt.component.scss']
})
export class CrtComponent implements OnInit {
  private subs = new SubSink();

  @ViewChild('Tabs', { static: true }) tabs: MatTabGroup;

  constructor(
    private socketClient: SocketClientService,
    private messenger: MessengerService,
    private regS: RegistartionService,
    private pTabS: PaymentTabService
  ) { }

  ngOnInit() {
    //  for initial selected tab
    setTimeout(() => {
      this.messenger.tabIndex = this.tabs.selectedIndex;
    }, 1000)

    this.subs.add(
      this.socketClient.onMessage(`/user/${sessionStorage.getItem('USER')}/queue/reply`)
        .subscribe(queue => {
          if(queue){
            //  NOTE decide active tab and perform its function
            switch(this.messenger.getCurrentDirectory()){
              case Tabs.REGISTRATION_MODULE: {
                this.regS.handleWebSocketQ(queue);
                break;
              }
              case Tabs.PAYMENT_TAB: {
                this.pTabS.handleWebSocketQ(queue);
                break;
              }
            }
          }

        })
    );
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    this.messenger.tabIndex = tabChangeEvent.index;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
