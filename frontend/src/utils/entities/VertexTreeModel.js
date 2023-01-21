export class VertexTreeModel {
    config = {
        outerSelect: false,
        height: 0,
        totalHeight: 0,
        detailHeight: 0,
        unitHeight: 0
    }

    treeNodeType = 'vertex'

    extend = false
    detail = false

    /** @type {MachineTreeModel[]} */
    machineTreeModelList = [];
    /** @type {Map<number, MachineTreeModel>} */
    machineTreeModelMap = new Map();

    _mainObj

    constructor(_mainObj) {
        this._mainObj = _mainObj;
    }
}
