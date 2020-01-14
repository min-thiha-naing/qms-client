import { Injectable } from '@angular/core';
import { DestinationStatus } from '../model/queue-status';

@Injectable({
  providedIn: 'root'
})
export class TransformerService {

  constructor() { }

  planListToDestLocList(planList: any[]): any[] {
    return planList.map((element, index) => {
      let destStatus;
      if (element.flag == 1) {
        destStatus = DestinationStatus.CLOSED;
      } else if (element.flag == 0) {
        if (!planList[index - 1] || planList[index - 1].flag == 1) {
          destStatus = DestinationStatus.SERVING;
        } else {
          destStatus = DestinationStatus.WAITING;
        }
      }

      return {
        ...element,
        destStatus: destStatus,
        isSelected: false,
      }
    });
  }
}
