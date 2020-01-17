export class Helper {


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
}