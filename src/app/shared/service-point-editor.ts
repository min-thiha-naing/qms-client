import { MatTableDataSource } from '@angular/material';
import { DestinationStatus } from '../model/queue-status';


//  NOTE Want to know what this class does? See only methods that are NOT private
export class ServicePointEditor {

    srcLocationDS = new MatTableDataSource<any>([]);
    destLocationDS = new MatTableDataSource<any>([]);

    private destStatus = DestinationStatus;

    constructor() {
    }

    setSrcLocationDS(workgroupList: any[]) {
        this.srcLocationDS = new MatTableDataSource<any>(workgroupList.map(element => this.transformWGtoSrcLoc(element)));
    }

    setDestLocationDS(planList: any[]) {
        this.destLocationDS = new MatTableDataSource<any>(this.transformPlanListToDestLocList(planList));
    }


    onDeselectAll() {
        this.srcLocationDS.data.forEach(el => {
            el.isSelected = false;
            el.orderId = null;
        })
    }

    onToggleSrcLoc(srcEl) {
        //  auto increment orderId
        if (srcEl.isSelected) {
            srcEl.orderId = Math.max(...(this.srcLocationDS.data.filter(el => el.isSelected == true).map(el => el.orderId))) + 1;
        } else {
            srcEl.orderId = null;
        }
    }

    private transformPlanListToDestLocList(planList) {
        return planList.map((element, index) => {
            return {
                ...element,
                isSelected: false,
            }
        });
    }

    private transformWGtoSrcLoc(wg: any) {
        return {
            ...wg,
            workgroupId: wg.id,
            isSelected: false,
            orderId: null,
        };
    }

    private transformSrcToDestLoc(srcLocs: any[]) {
        // make sure src is already sorted
        return srcLocs.map(el => {
            return {
                ...el,
                actFlag: this.destStatus.WAITING,
                isSelected: false,
            }
        })
    }

    private sortChosenSrcLocsByOrder(srcLocs: any[]) {
        return srcLocs
            .filter(el => el.isSelected == true)
            .sort((a, b) => {
                return a.orderId - b.orderId;
            })
    }

    addToFirst() {
        let upperDestLs = this.destLocationDS.data.filter(el => el.actFlag != this.destStatus.WAITING);

        let newDestLs = this.sortChosenSrcLocsByOrder(this.srcLocationDS.data);
        newDestLs = this.transformSrcToDestLoc(newDestLs);
        newDestLs = this.incrementOrderId(newDestLs, this.computeLargestOrderId(upperDestLs) + 1);

        let belowDestLs = this.destLocationDS.data.filter(el => el.actFlag == this.destStatus.WAITING);
        belowDestLs = this.incrementOrderId(belowDestLs, this.computeLargestOrderId(newDestLs) + 1);

        this.destLocationDS = new MatTableDataSource<any>([
            ...upperDestLs,
            ...newDestLs,
            ...belowDestLs].sort((a, b) => { return a.orderId - b.orderId }));
        console.log('DEST');
        console.log(this.destLocationDS.data);
    }

    addToLast() {
        let upperDestLs = this.destLocationDS.data;

        let newDestLs = this.sortChosenSrcLocsByOrder(this.srcLocationDS.data);
        newDestLs = this.transformSrcToDestLoc(newDestLs);
        newDestLs = this.incrementOrderId(newDestLs, this.computeLargestOrderId(upperDestLs) + 1);

        this.destLocationDS = new MatTableDataSource<any>([
            ...upperDestLs,
            ...newDestLs].sort((a, b) => { return a.orderId - b.orderId }));
        console.log('DEST');
        console.log(this.destLocationDS.data);
    }

    onRemove() {
        this.destLocationDS = new MatTableDataSource(this.destLocationDS.data.filter(el => el.isSelected == false));
    }

    onRevert() {
        var currDestClone = { ...this.destLocationDS.data.find(el => el.actFlag == this.destStatus.SERVING), id: null };
        currDestClone.orderId = Math.max(...this.destLocationDS.data.map(el => el.orderId)) + 1;
        currDestClone.actFlag = this.destStatus.WAITING;
        this.destLocationDS = new MatTableDataSource<any>([...this.destLocationDS.data, currDestClone]);
    }

    private computeLargestOrderId(list: any[]): number {
        return Math.max(...list.map(el => el.orderId));
    }

    private incrementOrderId(list: any[], startingOrderId: number) {
        return list.map(el => { return { ...el, orderId: startingOrderId++ } });
    }

    private getDestLocsByActFlag(destLocs: any[], status: any) {
        return destLocs.filter(el => el.actFlag == status);
    }

    getApiReqPayload(servingQ: any) {
        return {
            id: servingQ.id,
            visitId: servingQ.visitId,
            planList: [...this.destLocationDS.data.filter(loc => loc.actFlag == this.destStatus.WAITING)
                .map(loc => {
                    return {
                        ...loc,
                        id: null,
                        visitId: servingQ.visitId,
                        isSelected: false,
                    }
                })]
        }
    }

}
