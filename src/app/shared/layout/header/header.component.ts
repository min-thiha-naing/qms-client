import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { SubSink } from 'subsink';
import { MessengerService } from '../../messenger.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  servingQ: any = null;

  subs = new SubSink();
  constructor(
    private authService: AuthService,
    private messenger: MessengerService
  ) { }

  ngOnInit() {
    this.subs.add(this.messenger.servingQ.subscribe(q => this.servingQ = q));
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
