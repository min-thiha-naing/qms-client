import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-module-tab',
  templateUrl: './appointment-module-tab.component.html',
  styleUrls: ['./appointment-module-tab.component.scss']
})
export class AppointmentModuleTabComponent implements OnInit {
  appointmentDisplayedColumns: string[] = ['no', 'patientTitle', 'patientName', 'patientNric', 'apptTimestamp', 'apptDoctorMCR'];
  appointmentDataSource: MatTableDataSource<any>;
  appointmentSelection = new SelectionModel<any>(true, []);
  constructor() { }
  control = new FormControl();
  streets: string[] = ['Champs-Élysées', 'Lombard Street', 'Abbey Road', 'Fifth Avenue','Champs-Élysées', 'Lombard Street', 'Abbey Road', 'Fifth Avenue'];
  filteredStreets: Observable<string[]>;

  ngOnInit() {
    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.streets.filter(street => this._normalizeValue(street).includes(filterValue));
  }

  private _normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }
  

}
