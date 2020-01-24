import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  @ViewChild('input1',{static:true}) inputEl: ElementRef;
  constructor(
  ) { }

  ngOnInit() {
  }

  // ngAfterViewInit() {
  //   setTimeout(() => this.inputEl.nativeElement.focus());
  // }
  onfocus(){
    this.inputEl.nativeElement.focus()
  }

}
