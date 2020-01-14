import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  value: any
  constructor(
  ) { }

  ngOnInit() {
  }

  onChange(ev){
    console.log(ev);
    console.log(this.value);
  }

}
