import {VertexTDAG} from "@/utils/entities/VertexTDAG";
import {VertexTreeModel} from "@/utils/entities/VertexTreeModel";
import {VertexDAG} from "@/utils/entities/VertexDAG";
import {HighlightMode} from "@/utils/const/HightlightMode";

export class Vertex {
    vid
    vertexName
    type
    start
    end

    /** @type {Vertex[]} */
    srcVertexes = []
    /** @type {Vertex[]} */
    dstVertexes = []

    /** @type {Task[]} */
    tasks = []

    interact = {
        highlightMode: HighlightMode.NONE,
    }

    _dagViewObj;
    _tdagViewObj;
    _treeViewObj;

    constructor(rawVertex) {
        this.vid = rawVertex.vid;
        this.vertexName =  rawVertex.vertex_name;
        this.type = rawVertex.type.trim();
        this.start = rawVertex.start_time;
        this.end = rawVertex.end_time;
    }

    /**
     * @returns {Vertex & VertexDAG}
     */
    createDagViewObj() {
        const viewObj = Object.assign(Object.create(this), new VertexDAG(this));
        this._dagViewObj = viewObj;
        return viewObj;
    }

    /**
     * @returns {Vertex & VertexTDAG}
     */
    createTDagViewObj() {
        const viewObj = Object.assign(Object.create(this), new VertexTDAG(this));
        this._tdagViewObj = viewObj;
        return viewObj;
    }

    /**
     * @returns {Vertex & VertexTreeModel}
     */
    createTreeViewObj() {
        const viewObj = Object.assign(Object.create(this), new VertexTreeModel(this));
        this._treeViewObj = viewObj;
        return viewObj;
    }
}
