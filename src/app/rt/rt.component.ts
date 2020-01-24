import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SocketClientService } from '../socket-client.service';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';
import { MatTabChangeEvent, MatTabGroup } from '@angular/material';
import { RtService } from './rt.service';
import { Helper } from '../shared/helper.class';
import { MessengerService } from '../shared/messenger.service';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-rt',
  templateUrl: './rt.component.html',
  styleUrls: ['./rt.component.scss']
})
export class RtComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  @ViewChild('Tabs', { static: true }) tabs: MatTabGroup;

  constructor(
    private socketClient: SocketClientService,
    private messenger: MessengerService

  ) { }

  ngOnInit() {

    //  for initial selected tab
    setTimeout(() => {
      this.messenger.tabIndex = this.tabs.selectedIndex;
    }, 1000)

    Helper.setTabIndex(0)
    this.subs.add(
      this.socketClient.onMessage('/user/queue/reply')
        .subscribe(queues => {
          console.log(queues);
        })
    );
    //this.qS.getAllQueues().subscribe(res=>console.log(res))
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    console.log(tabChangeEvent.index);
    this.messenger.tabIndex = tabChangeEvent.index;
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
