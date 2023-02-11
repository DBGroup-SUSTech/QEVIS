import {Application} from "@/utils/entities/Application";
import {Vertex} from "@/utils/entities/Vertex";
import {Edge} from "@/utils/entities/Edge";

/**
 * Creates application instance, using raw data from backend
 *
 * @param rawApp
 * @returns {Application}
 */
export function initApplication(rawApp) {
    const app = new Application();
    initBasicInformation(app, rawApp);
    initVertexInformation(app, rawApp.vertexes);
    return app;
}

/**
 *
 * @param {Application}app
 * @param {Object} rawApp
 */
function initBasicInformation(app, rawApp) {
    const excludeFields = ['vertexes'];
    for (const field of Object.keys(rawApp)) {
        if (excludeFields.includes(field)) {
            continue;
        }
        const humpFieldName = toHump(field);
        app[humpFieldName] = rawApp[field];
    }
    // handle reference time
    app.referenceTime = parseInt(app.referenceTime);
}

/**
 * Underline to hump
 */
function toHump(varName) {
    return varName.replace(/_(\w)/g, function(all, letter){
        return letter.toUpperCase();
    });
}


/**
 * Loads vertex information into app instance
 *
 * @param {Application} app
 * @param {Object[]} rawVertexes
 * @returns {Application}
 */
export function initVertexInformation(app, rawVertexes) {
    // init vertex list and map
    const vertexes = [];
    const vertexMap = new Map();
    rawVertexes.forEach(rv => {
        const vertex = new Vertex(rv);
        vertexes.push(vertex);
        vertexMap.set(vertex.vid, vertex);
    });
    app.vertexes = vertexes;
    app.vertexMap = vertexMap;

    // process DAG
    const dagData = JSON.parse(app.queryDag);
    removeUnusedNodes(dagData);
    bindDAGInformation(app, dagData);
    initEdges(app, dagData);

    // find root
    let root = vertexes[0]
    while (root.dstVertexes.length !== 0) {
        root = root.dstVertexes[0];
    }
    app.dagRoot = root

    return app;
}

/**
 * Remove other type node and build dag information IN PLACE.
 *
 * @param {Object} dagData
 */
function removeUnusedNodes(dagData) {
    const nodes = dagData.vertexes;
    const edges = dagData.edges;

    const idx2node = new Map();
    nodes.forEach(node => idx2node.set(node.idx, node));

    // set node src/dst using edge info
    nodes.forEach(node => {
        node.srcNodes = [];
        node.dstNodes = [];
    });
    edges.forEach(edge => {
        const srcNode = idx2node.get(edge.src);
        const dstNode = idx2node.get(edge.dst);
        srcNode.dstNodes.push(dstNode);
        dstNode.srcNodes.push(srcNode);
    });

    // remove unused node
    let run = true;
    let getOtherTypeNode = function (nodes) {
        for (let i = 0, ilen = nodes.length; i < ilen; i++) {
            if (!nodes[i].name.match(/Map \d+/)
                && !nodes[i].name.match(/Reducer \d+/)) {
                return i
            }
        }
        return false
    }
    while (run) {
        let index = getOtherTypeNode(nodes);
        if (index === false) {
            run = false;
            break
        }
        let currentNode = nodes.splice(index, 1)[0];
        let srcNodes = currentNode.srcNodes;
        let dstNodes = currentNode.dstNodes;
        // console.log('remove node', currentNode.name)
        if (srcNodes.length === 0) {
            dstNodes.forEach(dstNode => {
                dstNode.srcNodes = dstNode.srcNodes.filter(node => node !== currentNode);
            });
        } else {
            srcNodes.forEach(srcNode => {
                dstNodes.forEach(dstNode => {
                    // console.log(srcNode.vertex_name, dstNode.vertex_name)
                    srcNode.dstNodes = srcNode.dstNodes.filter(node => node !== currentNode);
                    srcNode.dstNodes.push(dstNode);
                    dstNode.srcNodes = dstNode.srcNodes.filter(node => node !== currentNode);
                    dstNode.srcNodes.push(srcNode);
                })
            })
        }
    }
}

/**
 * Sets DAG dependency to vertex, using dagData.
 * Unused nodes are removed in last step.
 *
 * @param {Application} app
 * @param {Object} dagData
 */
function bindDAGInformation(app, dagData) {
    const nodes = dagData.vertexes;

    // set info to real vertex (src/dstVertexes field)
    const vertexName2node = new Map();
    nodes.forEach(node => vertexName2node.set(node.name, node));
    const vertexName2vertex = new Map();
    app.vertexes.forEach(vertex => vertexName2vertex.set(vertex.vertexName, vertex));

    app.vertexes.forEach(vertex => {
        // if (!vertexName2node.get(vertex.vertexName)) {
        //     console.log(nodes)
        //     console.log(vertexName2node, vertex.vertexName, vertex)
        //     console.log(app)
        // }
        const node = vertexName2node.get(vertex.vertexName);
        vertex.srcVertexes = node.srcNodes
            .map(node => vertexName2vertex.get(node.name));
        if (vertex.srcVertexes.some(v => !v)) {
            console.log(vertex, vertexName2vertex, node.srcNodes)
        }
        vertex.dstVertexes = node.dstNodes
            .map(node => vertexName2vertex.get(node.name));
    });
}

/**
 * Creates edges, using dagData.
 * Unused nodes are removed in last step.
 *
 * @param {Application} app
 * @param {Object} dagData
 */
function initEdges(app, dagData) {
    const nodes = dagData.vertexes;
    const edges = dagData.edges;

    const idx2node = new Map();
    nodes.forEach(node => idx2node.set(node.idx, node));
    const edgeId2type = new Map();
    edges.forEach(edge => {
        const edgeSrcName = idx2node.get(edge.src)?.name ?? '?';
        const edgeDstName = idx2node.get(edge.dst)?.name ?? '?';
        edgeId2type.set(edgeSrcName + '-' + edgeDstName, edge.type);
    });

    const newEdges = [];
    app.vertexes.forEach(src => {
        src.dstVertexes.forEach(dst => {
            // if (dst == null){
            //     console.log(src, dst, app.vertexes, app);
            // }
            const edgeId = src.vertexName + '-' + dst.vertexName;
            const type = edgeId2type.get(edgeId) ?? '@FAKE_EDGE';
            const newEdge = new Edge(src, dst, type);
            newEdges.push(newEdge);
        })
    });
    app.edges = newEdges;
}
