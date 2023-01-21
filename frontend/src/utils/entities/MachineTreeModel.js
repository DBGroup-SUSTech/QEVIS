export class MachineTreeModel {
    config = {
        outerSelect: false,
        height: 0,
        totalHeight: 0,
        detailHeight: 0,
        unitHeight: 0
    }

    treeNodeType = 'machine'

    vertexName
    machineName

    extend = false
    detail = false

    /** @type {TaskTreeModel[]} */
    taskTreeModelList = [];

    _mainObj

    constructor(_mainObj) {
        this._mainObj = _mainObj;
    }
}
