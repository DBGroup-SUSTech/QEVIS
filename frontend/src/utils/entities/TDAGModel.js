import * as d3 from "d3";
import {LayoutConfig} from "@/utils/const/LayoutConfig";

export class TDAGModel {
    /** @type {Application} */
    application

    /** @type {number} */
    startTime
    /** @type {number} */
    endTime
    /** @type {number} */
    globalEndTime


    /** @type {(Vertex & VertexTDAG)[]} */
    vertexes = []
    /** @type {Map<number, Vertex & VertexTDAG>} */
    vertexMap = new Map();
    /** @type {Edge & EdgeTDAG[]} */
    edges = [];
    /** @type {Map<string, Edge & EdgeTDAG>} */
    edgeMap = new Map();

    /** @type {d3.scaleLinear} */
    xScale

    /** @type {number}*/
    zoomScale

    /** @type {boolean}*/
    dragTrigger = false

    /** @type {Map}*/
    dragPara = new Map()

    /** @type {(number|number)[]} */
    baseXScaleRange

    /** @type {boolean}*/
    renderAxis = false

    /** @type {boolean}*/
    isGroupAxis = false

    /**@type {number}*/
    queryBarLen

    /**@type {number}*/
    zoomXRatio

    /**@type {number}*/
    paintLenRatio

    /**@type {number}*/
    zoomEventLen

    /**@type {number}*/
    zoomEventRatio

    /**
     * @param {Application} application
     */
    constructor(application) {
        this.application = application;
        const {marginLeft, width, marginRight} = LayoutConfig;
        this.xScale = d3.scaleLinear().range([marginLeft, width - marginLeft - marginRight]);
        this.queryBarLen = width - marginLeft - marginRight - marginLeft;
        this.baseXScaleRange = [marginLeft, (width - marginLeft - marginRight)]
        this.zoomXRatio = 0
        this.zoomScale = 0
        this.paintLenRatio = 0
        this.application.vertexes.forEach(v => {
            const vertex = v.createTDagViewObj()
            vertex.toRender = false;        // not to render by default
            this.vertexes.push(vertex);
            this.vertexMap.set(vertex.vid, vertex);
        });

        this.application.edges.forEach(e => {
            const edge = e.createTDagViewObj()
            edge.toRender = false;        // not to render by default
            this.edges.push(edge);
            this.edgeMap.set(edge.edgeId, edge);
        });
    }

    loadStatic() {
        this.startTime = 0;
        this.endTime = this.application.duration;
        this.vertexes.forEach(v => v.toRender = true);
        this.edges.forEach(e => e.toRender = true);
    }

    resizeXScale(width) {
        const {marginLeft, marginRight} = LayoutConfig;
        this.xScale.range([marginLeft, width - marginLeft - marginRight]);
        this.baseXScaleRange = [marginLeft, width - marginLeft - marginRight];
        this.queryBarLen = width - marginLeft - marginRight - marginLeft;

    }

    updateXScaleDomain(minVal, maxVal) {
        this.xScale.domain([minVal, maxVal]);
    }
    updateXScaleRange(minVal, maxVal){
        this.xScale.range([minVal, maxVal]);
        this.queryBarLen = maxVal - minVal
    }

    globalTimeUpdate(gEndTime){
        this.globalEndTime = gEndTime
    }
}
