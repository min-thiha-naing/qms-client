import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  vara = new BehaviorSubject<any>(null);

  constructor() { }
}
