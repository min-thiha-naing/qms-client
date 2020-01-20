import { Component, OnInit } from '@angular/core';
import { Helper } from '../shared/helper.class';
import { MatTabChangeEvent } from '@angular/material';
import { SubSink } from 'subsink';
import { SocketClientService } from '../socket-client.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crt',
  templateUrl: './crt.component.html',
  styleUrls: ['./crt.component.scss']
})
export class CrtComponent implements OnInit {
  private subs = new SubSink();
  constructor(
    private socketClient: SocketClientService,
    private router: Router,
  ) {}

  ngOnInit() {
    Helper.setTabIndex(0)
    this.subs.add(
      this.socketClient.onMessage('/user/queue/reply')
        .subscribe(queues => {
          console.log(queues);
        })
    );
  }

  tabChanged(tabChangeEvent: MatTabChangeEvent): void {
    console.log(tabChangeEvent);
    console.log(tabChangeEvent.index);
    Helper.setTabIndex(tabChangeEvent.index);
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
