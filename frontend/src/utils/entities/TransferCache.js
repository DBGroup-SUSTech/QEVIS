const CACHE_SIZE = 1000;

export class TransferCache {
    /** @type {number[]} */
    tidList = [];
    /** @type {Map<number, {srcTasks: Task[], dstTasks: Task[]}>} */
    transfersMap = new Map();

    /**
     * @param {number} tid
     * @return {boolean}
     */
    has(tid) {
        return this.transfersMap.has(tid);
    }

    /**
     * @param {number} tid
     * @param {Task[]} srcTasks
     * @param {Task[]} dstTasks
     */
    add(tid, srcTasks, dstTasks) {
        if (this.transfersMap.has(tid)) {
            this.tidList.splice(this.tidList.indexOf(tid), 1);
        } else {
            this.transfersMap.set(tid, {srcTasks, dstTasks});
        }
        if (this.tidList.length >= CACHE_SIZE) {
            this.remove(0);
        }
        this.tidList.push(tid);
    }

    /**
     * @param {number} tid
     * @return {{srcTasks: Task[], dstTasks: Task[]}}
     */
    getTransferTasks(tid) {
        return this.transfersMap.get(tid);
    }

    /**
     * @param {number=0} index
     * @return {null|number}
     */
    remove(index=0) {
        if (!this.tidList[index]) {
            return null;
        }
        const tid = this.tidList[index];
        this.tidList.splice(index, 1);
        this.transfersMap.delete(tid);
        return tid;
    }
}
