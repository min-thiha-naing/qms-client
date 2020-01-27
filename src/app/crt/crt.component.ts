import { Component, OnInit, ViewChild } from '@angular/core';
import { Helper } from '../shared/helper.class';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { SubSink } from 'subsink';
import { SocketClientService } from '../socket-client.service';
import { Router } from '@angular/router';
import { MessengerService } from '../shared/messenger.service';

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
  ) { }

  ngOnInit() {
    //  for initial selected tab
    setTimeout(() => {
      this.messenger.tabIndex = this.tabs.selectedIndex;
    }, 1000)
    // Helper.setTabIndex(0)
    this.subs.add(
      this.socketClient.onMessage('/user/queue/reply')
        .subscribe(queues => {
          console.log(queues);
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
