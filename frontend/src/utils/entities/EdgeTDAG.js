import {TDAGLayoutType} from "@/utils/const/TDAGLayoutType";

export class EdgeTDAG {
    /** @type {boolean} */
    toRender = true;
    /** @type {boolean} Is hidden in layout algorithm */
    isHidden = false;

    /** @type {TDAGLayoutType} */
    layoutType = TDAGLayoutType.DEFAULT;
    /** @type {number[][]} */
    dagrePoints = [];

    turningX = null;

    _mainObj

    constructor(_mainObj) {
        this._mainObj = _mainObj;
    }
}
