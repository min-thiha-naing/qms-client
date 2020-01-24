import { BehaviorSubject } from 'rxjs';

export class Helper {
  static onTabIndexChanged: number;
  static searchRes: BehaviorSubject<boolean>;

  static servingQ = new BehaviorSubject<any>(null);

  public static sortLocByOrderId(locList: any[]) {
    return locList.sort((a, b) => a.orderId - b.orderId);
  }

  public static addPropToRawQ(rawQ: any) {
    return {
      ...rawQ,
      callCount: 0,
      lastCallTime: null,
    }
  }

  public static transformPlanListToDestLocList(planList) {
    return planList.map((element, index) => {
      return {
        ...element,
        isSelected: false,
      }
    });
  }

  public static removeFromQueueList(_queues: BehaviorSubject<any[]>, response) {
    let newQs = [..._queues.getValue()].filter(q => q.id != response.id);
    _queues.next(newQs);
  }

  public static replaceCurrentQWithResp(_queues: BehaviorSubject<any[]>, response) {
    let newQs = [..._queues.getValue()].map(q => {
      if (q.id === response.id) {
        return response;
      }
      return q;
    });
    _queues.next(newQs);
  }

  public static returnQModifiedWithCallTime(existingQ, responseQ) {
    console.log(existingQ.callCount)
    return {
      ...responseQ,
      callCount: existingQ.callCount + 1,
      lastCallTime: new Date().toISOString(),
    }
  }

  public static addRespToQueueList(_queues: BehaviorSubject<any[]>, response, place?: string) {
    if (place && place == 'b') {
      let newQs = [..._queues.getValue(), response];
      _queues.next(newQs);
    } else {
      let newQs = [response, ..._queues.getValue()];
      _queues.next(newQs);
    }
  }

  public static internalDeletePlanList(queue: any, orderIdList: number[]) {
    queue.planList = (<Array<any>>queue.planList).filter(pl => !orderIdList.includes(pl.orderId));
    return queue;
  }

  public static setTabIndex(index) {
    this.onTabIndexChanged = index
  }

  public static setSearch(search) {
    this.searchRes = search
  }

  public static searchQByQNo(queueNo: any, queueList: any[]) {
    return queueList.find(el => el.queueNo == queueNo);
  }

}

