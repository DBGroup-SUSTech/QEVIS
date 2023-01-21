import {TaskTreeModel} from "@/utils/entities/TaskTreeModel";
import {TaskMatrixVO} from "@/utils/entities/TaskMatrixVO";
import {HighlightMode} from "@/utils/const/HightlightMode";

export class Task {
    tid
    /** @type {Vertex} */
    vertex
    /** @type {Machine} */
    machine
    suffix
    start
    end

    /** @type {Map<StepType, {type: StepType, start: number, end: number}>} */
    stepMap
    /** @type {Object} */
    counter = {}

    interact = {
        highlightMode: HighlightMode.NONE,
    }

    _dagViewObj;
    _treeViewObj;
    /** @type {TaskMatrixVO} */
    _matrixViewObj;

    /**
     * @returns {Task}
     */
    createDagViewObj() {
        const viewObj = Object.create(this);
        this._dagViewObj = viewObj;
        return viewObj;
    }

    /**
     * @returns {Task & TaskTreeModel}
     */
    createTreeViewObj() {
        const viewObj = Object.assign(Object.create(this), new TaskTreeModel(this));
        this._treeViewObj = viewObj;
        return viewObj;
    }

    createMatrixViewObj() {
        const viewObj = Object.assign(Object.create(this), new TaskMatrixVO(this));
        this._matrixViewObj = viewObj;
        return viewObj;
    }
}
