export class VertexLayoutData {
    x0
    x1
    y
    type
    /** @type {(number|string)[]} */
    vertexIdList

    toRender

    /**
     * @param {number} x0
     * @param {number} x1
     * @param {number} y
     * @param {string} type
     * @param toRender
     * @param {(number|string)[]} [vertexIdList=[]]
     */
    constructor(x0, x1, y, type, toRender, vertexIdList = []) {
        this.x0 = x0
        this.x1 = x1
        this.y = y
        this.type = type
        this.vertexIdList = vertexIdList
        this.toRender = toRender
    }
}
