import {MachineTreeModel} from "@/utils/entities/MachineTreeModel";

export class Machine {
    /** @type {string} */
    machineName
    /** @type {Record[]} */
    records = [];
    /** @type {Task[]} */
    tasks = [];
    /** @type {Set<number>} */
    vidSet = new Set();

    /** @type {MachineTreeModel} */
    _treeViewObj;

    constructor(machineName) {
        this.machineName = machineName;
    }

    /**
     * @return {Machine & MachineTreeModel}
     */
    createTreeViewObj() {
        const viewObj = Object.assign(Object.create(this), new MachineTreeModel(this));
        this._treeViewObj = viewObj;
        return viewObj;
    }
}
