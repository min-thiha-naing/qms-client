import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketClientService } from '../socket-client.service';
import { SubSink } from 'subsink';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rt',
  templateUrl: './rt.component.html',
  styleUrls: ['./rt.component.scss']
})
export class RtComponent implements OnInit, OnDestroy {

  private subs = new SubSink();

  constructor(
    private socketClient: SocketClientService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subs.add(
      this.socketClient.onMessage('/user/queue/reply')
        .subscribe(queues => {
          console.log(queues);
        })
    );
    //this.qS.getAllQueues().subscribe(res=>console.log(res))
  }


  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
