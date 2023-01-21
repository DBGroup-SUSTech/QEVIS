export class TaskTreeModel {
    config = {
        outerSelect: false,
        height: 0,
        totalHeight: 0,
        detailHeight: 0,
        unitHeight: 0
    }

    treeNodeType = 'task'

    vertexName
    machineName

    extend = false
    detail = false

    _mainObj

    constructor(_mainObj) {
        this._mainObj = _mainObj;
    }
}
