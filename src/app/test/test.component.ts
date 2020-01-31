import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TestService } from './test.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  obj: { a: any, b: any } = null;
  obj2: { a: any, b: any } = null;

  constructor(
    private testS: TestService,
  ) { }

  ngOnInit() {
    this.testS.vara.asObservable().subscribe(res => {
      console.log('emitted for obj1');
      this.obj = res
    }
    );
    this.testS.vara.asObservable().subscribe(res => {
      console.log('emitted for obj2');
      this.obj2 = res
    }
    );
  }

  emit() {
    this.testS.vara.next({ a: 'Next', b: 'Next B' });
  }

  check() {
    console.log(this.obj === this.obj2);
  }


  change() {
    this.obj2.a = "A has been changed !!!!";
  }
}
