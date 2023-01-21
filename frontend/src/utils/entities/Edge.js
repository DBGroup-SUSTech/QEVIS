import {EdgeTDAG} from "@/utils/entities/EdgeTDAG";

export class Edge {
    edgeId
    /** @type {Vertex} */
    src
    /** @type {Vertex} */
    dst
    type

    _dagViewObj;
    /** @type {Edge & EdgeTDAG} */
    _tdagViewObj;

    /**
     * @param {Vertex} src
     * @param {Vertex} dst
     * @param {string} type
     */
    constructor(src, dst, type) {
        this.edgeId = Edge.computeEdgeId(src, dst);
        this.src = src;
        this.dst = dst;
        this.type = type;
    }

    createDagViewObj() {
        const viewObj = Object.create(this);
        this._dagViewObj = viewObj;
        return viewObj;
    }

    createTDagViewObj() {
        const viewObj = Object.assign(Object.create(this), new EdgeTDAG(this));
        this._tdagViewObj = viewObj;
        return viewObj;
    }

    /**
     * @param {Vertex} src
     * @param {Vertex} dst
     */
    static computeEdgeId(src, dst) {
        return src.vid + '-' + dst.vid;
    }
}
