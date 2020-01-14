import { Component, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { MatTableDataSource, MatTable } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  queueDisplayedColumns: string[] = ['qNo', 'name', 'mrn', 'visitType', 'apptTime', 'waitTime', 'tWaitTime', 'callTime', 'remarks'];
  queueDataSource: MatTableDataSource<any>;
  queueSelection = new SelectionModel<any>(true, []);

  locationDisplayedColumns: string[] = ['select', 'location', 'inQ', 'order'];
  locationDataSource: MatTableDataSource<Location>;
  locationSelection = new SelectionModel<Location>(true, []);
  @ViewChild('journeyTable',{static:true}) journeyTable: MatTable<any>;
  journeyDisplayedColumns: string[] = ['select', 'clinic', 'location', 'apptTime', 'createdBy', 'status'];
  journeyDataSource: MatTableDataSource<any>;
  journeySelection = new SelectionModel<any>(true, []);

  constructor(
 
  ) {}
  ngOnInit() {

  }
}
