import { Component, OnInit } from '@angular/core';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'qms-client';
  subs = new SubSink();

  constructor(
  ) { }

  ngOnInit() {
  }
}
