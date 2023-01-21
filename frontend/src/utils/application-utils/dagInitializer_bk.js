import {Application} from "@/utils/entities/Application";

export function initApplication(rawApp) {
    const app = new Application()

    app.rawData = rawApp;

    app.appName = rawApp.query_name
    const dagData = app.dagData = JSON.parse(rawApp.query_dag)
    app.sqlData = rawApp.query_string

    dagData.vertexes.forEach(vertex => {
        vertex.layout = {selected: false}
        vertex.type = vertex.name.match(/^Map \d*$/) ? "Map"
            : vertex.name.match(/^Reducer \d*$/) ? "Reducer"
                : "OtherType";
    })
    dagData.vertexMap = {}

    let orderedNodes = sortGraphNodes(dagData.vertexes, dagData.edges);
    let orderedVertexIdx = [];
    orderedNodes.forEach(node => orderedVertexIdx.push(node.idx));
    app.orderedVertexIdx = orderedVertexIdx;

    /* setup info for greedy algorithm */
    let childrenMap = {}, parentsMap = {}
    let getChildren = function (node) {
        let ret = []
        node.children.forEach(child => {
            if (child.type === "OtherType") {
                getChildren(child).forEach(grandChild => ret.push(grandChild))
            } else {
                ret.push(child)
            }
        })
        return ret
    }

    orderedNodes.forEach(node => parentsMap[node.name] = [])
    orderedNodes.forEach(node => {
        if (node.type === "OtherType") {
            return
        }
        let children = getChildren(node)
        let childrenNames = children.map(child => child.name)
        childrenMap[node.name] = childrenNames

        childrenNames.forEach(childName => {
            parentsMap[childName].push(node.name)
        })
    })
    // sort them
    let orderMap = {}       // vertex id-> order idx
    orderedNodes.forEach((node, i) => orderMap[node.name] = i)
    for (let vertexName in childrenMap) {
        childrenMap[vertexName].sort((c1, c2) => orderMap[c1] - orderMap[c2])
    }
    for (let vertexName in parentsMap) {
        parentsMap[vertexName].sort((p1, p2) => orderMap[p1] - orderMap[p2])
    }
    app.childrenMap = childrenMap
    app.parentsMap = parentsMap
    app.orderMap = orderMap
    // console.log('childrenMap', childrenMap)
    // console.log('parentsMap', parentsMap)

    //TODO: start
    //
    let nodes = dagData.vertexes;
    let rawEdges = dagData.edges;
    let idMap = {};
    app.dagData.vertexMap = {}
    nodes.forEach(node => {
        app.dagData.vertexMap[node.name] = node;
        idMap[node.idx] = node;
        node.srcNodes = [];
        node.dstNodes = [];
    });
    let edges = [];
    rawEdges.forEach(edge => {
        edge.srcNode = idMap[edge.src];
        edge.dstNode = idMap[edge.dst];
        if (!edge.srcNode.dstEdges) {
            edge.srcNode.dstEdges = [];
        }
        edge.srcNode.dstEdges.push(edge);
        if (!edge.dstNode.srcEdges) {
            edge.dstNode.srcEdges = [];
        }
        edge.dstNode.srcEdges.push(edge);
    });
    rawEdges.forEach(edge => {
        edge.srcNode.dstNodes.push(edge.dstNode);
        edge.dstNode.srcNodes.push(edge.srcNode);
    })

    let run = true;
    let getOtherTypeNode = function (nodes) {
        for (let i = 0, ilen = nodes.length; i < ilen; i++) {
            if (nodes[i].type === "OtherType") {
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
        // console.log('remove node', currentNode.vertex_name)
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

    nodes.forEach((srcNode) => {
        srcNode.dstNodes.forEach(dstNode => {
            let edge = {
                src: srcNode.idx,
                dst: dstNode.idx,
                srcNode: srcNode,
                dstNode: dstNode,
                idx: srcNode.idx + '_' + dstNode.idx,
                srcVertexName: srcNode.name,
                dstVertexName: dstNode.name,
                srcRealNode: null,
                dstRealNode: null
            }
            edges.push(edge)
        })
    })
    app.edges = edges;
    //TODO: end;

    let root = nodes[0]
    while (root.parent.length !== 0) {
        root = root.parent[0]
    }
    app.dagRoot = root.name

    return app;
}

function sortGraphNodes(nodes, edges) {
    let idNode = {};
    nodes.forEach(node => {
        idNode[node.idx] = node
        node.children = [];
        node.parent = [];
    })
    edges.forEach(edge => {
        let parentNode = idNode[edge.dst], childNode = idNode[edge.src];
        parentNode.children.push(childNode);
        childNode.parent.push(parentNode);
    })

    let orderedNodes = [];
    let visitMap = {}
    let procNode = function (node) {
        if (visitMap[node.idx] !== undefined) {
            return
        }
        node.children.forEach(child => {
            procNode(child)
        })
        orderedNodes.push(node);
        visitMap[node.idx] = node
    }
    let root = nodes[0]
    while (root.parent.length !== 0) {
        root = root.parent[0]
    }
    procNode(root)
    return orderedNodes
}

export function loadVertexInformation(app, rawVertexes) {
    console.log(app, rawVertexes)
    rawVertexes.forEach(rv => {
        app.dagData.vertexMap[rv.vertex_name].rawData = rv;
    });
    // extra processing
    rawVertexes.forEach(rv => {
        rv.type = rv.type.trim();
    })
    return app;
}

