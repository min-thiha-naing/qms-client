import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { ApiService } from '../shared/api.service';

@Component({
  selector: 'app-print-page',
  templateUrl: './print-page.component.html',
  styleUrls: ['./print-page.component.scss']
})
export class PrintPageComponent implements OnInit {
  date = new Date();
  elementType = 'svg';
  value = 'XXXXX567L';
  format = 'CODE128';
  lineColor = '#000000';
  width = 1;
  height = 50;
  displayValue = true;
  fontOptions = '';
  font = 'monospace';
  textAlign = 'center';
  textPosition = 'top';
  textMargin = 4;
  fontSize = 12;
  background = '#ffffff';
  marginTop = 20;
  marginBottom = 10;
  marginLeft = 0;
  marginRight = 0;
  locations: any[] = []
  queueNo: any;
  patientInfo: any;
  constructor(
    private api: ApiService
  ) { }

  get values(): string[] {
    return this.value.split('\n');
  }

  ngOnInit() {
    console.log(history.state)
    this.locations = history.state.queue.planList;
    this.queueNo = history.state.queue.queueNo;
    console.log(this.locations)
    this.api.search(this.queueNo).subscribe(resp => {
      this.patientInfo = resp;
    })
  }

  onPrint() {
    window.print();
  }

}
