import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessengerService {

  private _tabIndex: number;
  private _servingQ = new BehaviorSubject<any>(null);
  
  private _searchResultFoundFrontend = new Subject<any>();

  set tabIndex(ind: number) {
    this._tabIndex = ind;
  }

  get servingQ() {
    return this._servingQ.asObservable();
  }

  set servingQ(queue: any) {
    this._servingQ.next(queue);
  }

  get searchResultFoundFrontend(){
    return this._searchResultFoundFrontend.asObservable();
  }

  emitSearchResultFoundFrontend(result) {
    this._searchResultFoundFrontend.next(result);
  }


  constructor(
    private router: Router,
  ) { }


  isThereServingQ() {
    if (this._servingQ.value)
      return true;
    else
      return false;
  }

  getCurrentDirectory(): String {
    return this.getDirectory(this.router.url, this._tabIndex);
  }

  private getDirectory(routerUrl: String, tabIndex: number): String {
    switch (routerUrl) {
      case '/rt': {
        switch (tabIndex) {
          case 0:
            return Tabs.ROOM_MODULE
          default:
            return Tabs.NONE
        }
      }
      case '/crt': {
        switch (tabIndex) {
          case 0:
            return Tabs.REGISTRATION_MODULE
          case 2:
            return Tabs.PAYMENT_TAB
          default:
            return Tabs.NONE
        }
      }
    }
  }
}


export const Tabs = {
  ROOM_MODULE: 'Room Module',
  REGISTRATION_MODULE: 'Registration Module',
  PAYMENT_TAB: 'Payment Tab',
  NONE: 'none'
}