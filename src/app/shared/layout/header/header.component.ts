import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { QueueService } from '../../queue.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  servingQ: any = null;

  subs = new SubSink();
  constructor(
    private authService: AuthService,
    private qS: QueueService,
  ) { }

  ngOnInit() {
    this.subs.add(this.qS._servingQ.asObservable().subscribe(q=> this.servingQ = q));
    this.subs.add(this.qS._crtServingQ.asObservable().subscribe(q=> this.servingQ = q));
  }

  logout() {
    this.authService.logout();
  }

}
