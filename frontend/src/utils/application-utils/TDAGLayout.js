/* eslint-disable */

import {Graph} from "@/utils/utils/graph";
import {VertexLayoutData} from "@/utils/entities/VertexLayoutData";
import {LayoutConfig} from "@/utils/const/LayoutConfig";
import {GreedyLayoutAlgo} from "@/utils/algo/greedy-tdag-layout/GreedyLayoutAlgo";
import {TreeLayoutAlgo} from "@/utils/algo/tree-tdag-layout/TreeLayoutAlgo";
import {EdgeLayoutData} from "@/utils/entities/EdgeLayoutData";
import {DagreLayoutAlgo} from "@/utils/algo/dagre-tdag-layout/DagreLayoutAlgo";
import {TDAGLayoutType} from "@/utils/const/TDAGLayoutType";
import {StartTimeLayoutAlgo} from "@/utils/algo/native-layout/StartTimeLayoutAlgo";
import {SimpleTreeLayoutAlgo} from "@/utils/algo/native-layout/SimpleTreeLayoutAlgo";
import TweenLite from 'gsap';


/**
 * @param {TDAGModel} tdagModel
 * @param useAnimation
 */
export function layoutTDAG(tdagModel, useAnimation=false) {
    // const start = new Date();

    // greedyLayout(tdagModel);
    // treeLayout(tdagModel);
    // startTimeLayout(tdagModel);
    // simpleTreeLayout(tdagModel);
    // dagreLayout(tdagModel);

    if (useAnimation) {
        aniTreeLayout(tdagModel);
    } else {
        treeLayout(tdagModel);
    }

    // const end = new Date();
    // console.log('tdag layout time', end - start);
}

/* Greedy layout */

/**
 * @param {TDAGModel} tdagModel
 */
function greedyLayout(tdagModel) {
    tdagModel.xScale.domain([tdagModel.startTime, tdagModel.endTime + 1000]);

    const gapTime = tdagModel.xScale.invert(LayoutConfig.gapPixel);
    const laneMap = computeLaneMap(tdagModel.vertexes, gapTime);
    Object.keys(laneMap).forEach(vid => {
        const lane = laneMap[vid];
        const vertex = tdagModel.vertexMap.get(parseInt(vid));
        vertex.layout.y = LayoutConfig.vertexContainerHeight * lane;
    });

    tdagModel.vertexes.forEach(v => {
        if (!v.toRender) {
            return;
        }
        v.layout.x = tdagModel.xScale(v.start);
        v.layout.width = tdagModel.xScale(v.end) - tdagModel.xScale(v.start);
        v.layout.height = LayoutConfig.vertexHeight;
    });
}

function computeLaneMap(vertexes, gapTime) {
    // get ready for the layout algo
    let graph = new Graph()
    vertexes.forEach(vertex => {
        const toRender = vertex.toRender;
        let vld = new VertexLayoutData(vertex.start, vertex.end, 0,
            '', toRender, [vertex.vertexName])
        graph.addNode(vertex.vid, vld)
    })
    vertexes.forEach(vertex => {
        vertex.dstVertexes.forEach(dst => graph.addEdge(vertex.vid, dst.vid));
    });

    // find root
    let root = vertexes[0];
    while (root.dstVertexes.length !== 0) {
        root = root.dstVertexes[0];
    }

    // run layout algo
    let greedyLayoutAlgo = new GreedyLayoutAlgo(root.vid, graph, gapTime);
    greedyLayoutAlgo.solve();

    return greedyLayoutAlgo.nodeLaneMap;
}

/* Tree layout */

function treeLayout(tdagModel) {
    if (tdagModel.isGroupAxis){
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.globalEndTime + 1000]);
    }else {
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.endTime + 1000]);
    }

    const gapTime = tdagModel.xScale.invert(LayoutConfig.gapPixel);

    const {nodeDataMap, edgeDataMap} = computeLayoutInfo(tdagModel.vertexes, gapTime);

    for (const vid of nodeDataMap.keys()) {
        const line = nodeDataMap.get(vid).y;
        const vertex = tdagModel.vertexMap.get(parseInt(vid));
        vertex.layout.y = LayoutConfig.vertexContainerHeight * line;
    }

    for (const edgeId of edgeDataMap.keys()) {
        const edgeData = edgeDataMap.get(edgeId);
        const edge = tdagModel.edgeMap.get(edgeId);
        edge.isHidden = edgeData.isHidden;
        edge.turningX = tdagModel.xScale(edgeData.turningX);
        edge.layoutType = TDAGLayoutType.TREE;
    }

    tdagModel.vertexes.forEach(v => {
        if (!v.toRender) {
            return;
        }
        v.layout.x = tdagModel.xScale(v.start);
        v.layout.width = tdagModel.xScale(v.end) - tdagModel.xScale(v.start);
        v.layout.height = LayoutConfig.vertexHeight;
    });
}

/**
 * @param {Vertex[]} vertexes
 * @param gapTime
 * @returns {{nodeDataMap: Map<number|string, VertexLayoutData>, edgeDataMap: Map<number|string, EdgeLayoutData>}}
 */
function computeLayoutInfo(vertexes, gapTime) {
    // get ready for the layout algo
    let graph = new Graph()
    vertexes.forEach(vertex => {
        const toRender = vertex.toRender;
        let vld = new VertexLayoutData(vertex.start, vertex.end, 0,
            '', toRender, [vertex.vertexName])
        graph.addNode(vertex.vid, vld)
    })
    vertexes.forEach(vertex => {
        vertex.dstVertexes.forEach(dst => {
            graph.addEdge(vertex.vid, dst.vid, new EdgeLayoutData());
        });
    });

    // find root
    let root = vertexes[0];
    while (root.dstVertexes.length !== 0) {
        root = root.dstVertexes[0];
    }

    // run layout algo
    let treeLayoutAlgo = new TreeLayoutAlgo(root.vid, graph, gapTime);
    treeLayoutAlgo.solve();

    const nodeDataMap = new Map();
    treeLayoutAlgo.graph.nodes.forEach(node => {
        nodeDataMap.set(node.id, node.data);
    });
    const edgeDataMap = new Map();
    treeLayoutAlgo.graph.edges.forEach(e => {
        const edgeId = e.src.id + '-' + e.dst.id;       // node id is vid
        edgeDataMap.set(edgeId, e.data);
    });

    return {nodeDataMap, edgeDataMap};
}

/* Ani tree layout */

/**
 * @param {TDAGModel} tdagModel
 */
function aniTreeLayout(tdagModel) {
    if (tdagModel.isGroupAxis){
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.globalEndTime + 1000]);
    }else {
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.endTime + 1000]);
    }

    const gapTime = tdagModel.xScale.invert(LayoutConfig.gapPixel);

    const {nodeDataMap, edgeDataMap} = computeLayoutInfo(tdagModel.vertexes, gapTime);

    for (const vid of nodeDataMap.keys()) {
        const line = nodeDataMap.get(vid).y;
        const vertex = tdagModel.vertexMap.get(parseInt(vid));
        vertex.layout.y = LayoutConfig.vertexContainerHeight * line;
    }

    for (const edgeId of edgeDataMap.keys()) {
        const edgeData = edgeDataMap.get(edgeId);
        const edge = tdagModel.edgeMap.get(edgeId);
        edge.isHidden = edgeData.isHidden;

        const newTurningX = tdagModel.xScale(edgeData.turningX)
        if (edge.turningX === null) {
            edge.turningX = newTurningX;
        } else {
            TweenLite.to(edge, tdagModel.application.updateRate / 1000, {turningX: newTurningX});
        }
        edge.layoutType = TDAGLayoutType.TREE;
    }

    tdagModel.vertexes.forEach(v => {
        if (!v.toRender) {
            return;
        }
        const newLayout = {
            x: tdagModel.xScale(v.start),
            width: tdagModel.xScale(v.end) - tdagModel.xScale(v.start),
        };
        if (v.layout.x === 0 && v.layout.width === 0) {
            Object.assign(v.layout, newLayout);
        } else {
            TweenLite.to(v.layout, tdagModel.application.updateRate / 1000, newLayout);
        }
        v.layout.height = LayoutConfig.vertexHeight;
    });
}


/* Start time layout */

function startTimeLayout(tdagModel) {
    if (tdagModel.isGroupAxis){
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.globalEndTime + 1000]);
    } else {
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.endTime + 1000]);
    }

    const gapTime = tdagModel.xScale.invert(LayoutConfig.gapPixel);

    const {nodeDataMap, edgeDataMap} = computeLayoutInfoStartTimeLayout(tdagModel.vertexes, gapTime);

    for (const vid of nodeDataMap.keys()) {
        const line = nodeDataMap.get(vid).y;
        const vertex = tdagModel.vertexMap.get(parseInt(vid));
        vertex.layout.y = LayoutConfig.vertexContainerHeight * line;
    }

    for (const edgeId of edgeDataMap.keys()) {
        const edgeData = edgeDataMap.get(edgeId);
        const edge = tdagModel.edgeMap.get(edgeId);
        edge.isHidden = edgeData.isHidden;
        edge.turningX = tdagModel.xScale(edgeData.turningX);
        edge.layoutType = TDAGLayoutType.START_TIME;
    }

    tdagModel.vertexes.forEach(v => {
        if (!v.toRender) {
            return;
        }
        v.layout.x = tdagModel.xScale(v.start);
        v.layout.width = tdagModel.xScale(v.end) - tdagModel.xScale(v.start);
        v.layout.height = LayoutConfig.vertexHeight;
    });
}

/**
 * @param {Vertex[]} vertexes
 * @param gapTime
 * @returns {{nodeDataMap: Map<number|string, VertexLayoutData>, edgeDataMap: Map<number|string, EdgeLayoutData>}}
 */
function computeLayoutInfoStartTimeLayout(vertexes, gapTime) {
    // get ready for the layout algo
    let graph = new Graph()
    vertexes.forEach(vertex => {
        const toRender = vertex.toRender;
        let vld = new VertexLayoutData(vertex.start, vertex.end, 0,
            '', toRender, [vertex.vertexName])
        graph.addNode(vertex.vid, vld)
    })
    vertexes.forEach(vertex => {
        vertex.dstVertexes.forEach(dst => {
            graph.addEdge(vertex.vid, dst.vid, new EdgeLayoutData());
        });
    });

    // find root
    let root = vertexes[0];
    while (root.dstVertexes.length !== 0) {
        root = root.dstVertexes[0];
    }

    // run layout algo
    let startTimeLayoutAlgo = new StartTimeLayoutAlgo(root.vid, graph, gapTime);
    startTimeLayoutAlgo.solve();

    const nodeDataMap = new Map();
    startTimeLayoutAlgo.graph.nodes.forEach(node => {
        nodeDataMap.set(node.id, node.data);
    });
    const edgeDataMap = new Map();
    startTimeLayoutAlgo.graph.edges.forEach(e => {
        const edgeId = e.src.id + '-' + e.dst.id;       // node id is vid
        edgeDataMap.set(edgeId, e.data);
    });

    return {nodeDataMap, edgeDataMap};
}

/* Simple tree layout */

function simpleTreeLayout(tdagModel) {
    if (tdagModel.isGroupAxis){
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.globalEndTime + 1000]);
    } else {
        tdagModel.xScale.domain([tdagModel.startTime, tdagModel.endTime + 1000]);
    }

    const gapTime = tdagModel.xScale.invert(LayoutConfig.gapPixel);

    const {nodeDataMap, edgeDataMap} = computeLayoutInfoSimpleTreeLayout(tdagModel.vertexes, gapTime);

    for (const vid of nodeDataMap.keys()) {
        const line = nodeDataMap.get(vid).y;
        const vertex = tdagModel.vertexMap.get(parseInt(vid));
        vertex.layout.y = LayoutConfig.vertexContainerHeight * line;
    }

    for (const edgeId of edgeDataMap.keys()) {
        const edgeData = edgeDataMap.get(edgeId);
        const edge = tdagModel.edgeMap.get(edgeId);
        edge.isHidden = edgeData.isHidden;
        edge.turningX = tdagModel.xScale(edgeData.turningX);
        edge.layoutType = TDAGLayoutType.START_TIME;
    }

    tdagModel.vertexes.forEach(v => {
        if (!v.toRender) {
            return;
        }
        v.layout.x = tdagModel.xScale(v.start);
        v.layout.width = tdagModel.xScale(v.end) - tdagModel.xScale(v.start);
        v.layout.height = LayoutConfig.vertexHeight;
    });
}

/**
 * @param {Vertex[]} vertexes
 * @param gapTime
 * @returns {{nodeDataMap: Map<number|string, VertexLayoutData>, edgeDataMap: Map<number|string, EdgeLayoutData>}}
 */
function computeLayoutInfoSimpleTreeLayout(vertexes, gapTime) {
    // for query 49
    // const vertexNames = ['Map 26', 'Map 12', 'Reducer 18', 'Map 27', 'Reducer 19', 'Reducer 20',
    //     'Reducer 21', 'Reducer 22', 'Map 24', 'Reducer 13', 'Map 25', 'Reducer 14',
    //     'Reducer 15', 'Reducer 16', 'Reducer 17', 'Map 23', 'Map 1', 'Reducer 2', 'Reducer 3',
    //     'Reducer 4', 'Reducer 5', 'Reducer 6', 'Reducer 8', 'Reducer 10', 'Reducer 11']
    // for query 54
    const vertexNames = ['Map 22', 'Reducer 28', 'Reducer 25', 'Reducer 26', 'Reducer 27',
        'Reducer 23', 'Reducer 24', 'Map 11', 'Map 10', 'Map 12', 'Map 18', 'Map 19',
        'Reducer 14', 'Map 20', 'Reducer 15', 'Map 21', 'Reducer 16', 'Reducer 17',
        'Map 1', 'Map 9', 'Reducer 2', 'Reducer 3', 'Reducer 4', 'Reducer 5',
        'Reducer 6', 'Reducer 7', 'Reducer 8']
    // for query 5
    // const vertexNames = ['Map 24', 'Map 22', 'Reducer 23', 'Map 25', 'Map 9', 'Map 20',
    //     'Reducer 13', 'Reducer 14', 'Map 18', 'Map 16', 'Reducer 10', 'Map 19',
    //     'Reducer 11', 'Reducer 12', 'Map 1', 'Map 8', 'Map 15', 'Reducer 3',
    //     'Reducer 4', 'Reducer 6', 'Reducer 7']

    vertexes.sort((v, w) =>
        vertexNames.indexOf(v.vertexName) - vertexNames.indexOf(w.vertexName))
    vertexes.forEach(v => {
        v.srcVertexes.sort((v, w) =>
            vertexNames.indexOf(v.vertexName) - vertexNames.indexOf(w.vertexName))
        v.dstVertexes.sort((v, w) =>
            vertexNames.indexOf(v.vertexName) - vertexNames.indexOf(w.vertexName))
    })

    // get ready for the layout algo
    let graph = new Graph()
    vertexes.forEach(vertex => {
        const toRender = vertex.toRender;
        let vld = new VertexLayoutData(vertex.start, vertex.end, 0,
            '', toRender, [vertex.vertexName])
        graph.addNode(vertex.vid, vld)
    })
    vertexes.forEach(vertex => {
        vertex.dstVertexes.forEach(dst => {
            graph.addEdge(vertex.vid, dst.vid, new EdgeLayoutData());
        });
    });

    // find root
    let root = vertexes[0];
    while (root.dstVertexes.length !== 0) {
        root = root.dstVertexes[0];
    }

    // run layout algo
    let startTimeLayoutAlgo = new SimpleTreeLayoutAlgo(root.vid, graph, gapTime);
    startTimeLayoutAlgo.solve();

    const nodeDataMap = new Map();
    startTimeLayoutAlgo.graph.nodes.forEach(node => {
        nodeDataMap.set(node.id, node.data);
    });
    const edgeDataMap = new Map();
    startTimeLayoutAlgo.graph.edges.forEach(e => {
        const edgeId = e.src.id + '-' + e.dst.id;       // node id is vid
        edgeDataMap.set(edgeId, e.data);
    });

    return {nodeDataMap, edgeDataMap};
}

/* Dagre layout */

function dagreLayout(tdagModel) {
    tdagModel.xScale.domain([tdagModel.startTime, tdagModel.endTime + 1000]);
    const gapTime = tdagModel.xScale.invert(LayoutConfig.gapPixel);

    const dagreLayoutAlgo = new DagreLayoutAlgo(gapTime, LayoutConfig);
    tdagModel.vertexes.forEach(v => {
        dagreLayoutAlgo.setNode(v.vid, v.start, v.end + gapTime);
    });
    tdagModel.edges.forEach(e => {
        dagreLayoutAlgo.setEdge(e.src.vid, e.dst.vid);
    });
    console.log('group layout(dagre)', dagreLayoutAlgo);
    dagreLayoutAlgo.solve();

    tdagModel.vertexes.forEach(vertex => {
        const nodeLayout = dagreLayoutAlgo.nodeLayoutMap.get(vertex.vid);
        vertex.layout.y = nodeLayout.y / 10;
    });

    tdagModel.vertexes.forEach(v => {
        if (!v.toRender) {
            return;
        }
        v.layout.x = tdagModel.xScale(v.start);
        v.layout.width = tdagModel.xScale(v.end) - tdagModel.xScale(v.start);
        v.layout.height = LayoutConfig.vertexHeight;
    });
    tdagModel.edges.forEach(e => {
        e.layoutType = TDAGLayoutType.DAGRE;
        const points = dagreLayoutAlgo.edgeLayoutMap.get(e.edgeId);
        e.dagrePoints = points.map(p => {
            // const x = tdagModel.xScale(p.x);
            const x = p.x;
            const y = p.y / 10;
            return [x, y];
        });
        // console.log(e, points);
    });
}
