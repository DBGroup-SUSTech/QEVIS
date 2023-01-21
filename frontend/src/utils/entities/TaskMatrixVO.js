export class TaskMatrixVO {
    x = 0;
    y = 0;

    // highlightAsProvider = false;
    // highlight = false;
    // highlightAsConsumer = false;

    /** @type {Task} */
    _mainObj

    constructor(mainObj) {
        this._mainObj = mainObj;
    }
}
