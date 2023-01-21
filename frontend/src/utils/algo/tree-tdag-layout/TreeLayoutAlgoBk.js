/* eslint-disable */

import {Edge} from "@/utils/utils/graph";

export class TreeLayoutAlgo {
    rootId
    /** @type {Graph<VertexLayoutData, EdgeLayoutData>} */
    graph
    gapPixel

    hiddenEdgeSet;

    /** @type {Set<(number|string)>} */
    visitedSet

    /**
     * @param {(string|number)} rootId
     * @param {Graph<VertexLayoutData, EdgeLayoutData>} graph
     * @param {number} gapPixel
     */
    constructor(rootId, graph, gapPixel) {
        this.rootId = rootId
        this.graph = graph
        this.gapPixel = gapPixel;
        console.log(this.gapPixel)
    }

    solve() {
        this.computeHiddenEdgeSet();
        this.reorderInAndOutEdges();
        this.setLines();
        // this.compress();
    }

    computeHiddenEdgeSet() {
        this.hiddenEdgeSet = new Set();
        const multiOutNodes = this.graph.nodes.filter(node => node.outEdges.length > 1);

        this.graph.edges.forEach(e => e.data.isHidden = false);

        multiOutNodes.forEach(curNode => {
            const dstNodes = curNode.outEdges.map(e => e.dst);
            // find dst node closest to it
            let closestDstNode = null;
            if (dstNodes.every(node => !node.data.toRender)) {
                // just pick the first one
                closestDstNode = dstNodes[0];
            } else {
                // find the closest dst node
                dstNodes.forEach(dstNode => {
                    if (!dstNode.data.toRender) {
                        return;
                    }
                    if (closestDstNode === null || closestDstNode.data.x0 > dstNode.data.x0) {
                        closestDstNode = dstNode;
                    }
                });
            }
            curNode.outEdges.forEach(e => {
                if (e.dst !== closestDstNode) {
                    this.hiddenEdgeSet.add(e);
                    e.data.isHidden = true;
                }
            });
        });
    }

    reorderInAndOutEdges() {
        const subTreeStartMap = new Map();
        this.visitedSet = new Set();
        /**
         * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
         * @returns {number}
         */
        const processSubTreeStart = (node) => {
            if (this.visitedSet.has(node.id)) {
                return Infinity;
            }
            this.visitedSet.add(node.id);

            let start = node.data.x0;
            node.inEdges
                .filter(e => !this.hiddenEdgeSet.has(e))
                .forEach(e => {
                    const childStart = processSubTreeStart(e.src);
                    start = Math.min(start, childStart);
                })
            subTreeStartMap.set(node.id, start);
            return start;
        }
        processSubTreeStart(this.graph.nodeMap.get(this.rootId));

        this.graph.nodes.forEach(node => {
            node.inEdges.sort((e1, e2) =>
                subTreeStartMap.get(e1.src.id) - subTreeStartMap.get(e2.src.id));
            node.outEdges.sort((e1, e2) =>
                subTreeStartMap.get(e1.src.id) - subTreeStartMap.get(e2.src.id));
        })
    }

    setLines() {
        this.visitedSet = new Set();
        // const lineMap = this.layoutVertex1(this.graph.nodeMap.get(this.rootId));
        // const lineMap = this.layoutVertex2(this.graph.nodeMap.get(this.rootId));
        // const lineMap = this.layoutVertex3(this.graph.nodeMap.get(this.rootId));
        // const lineMap = this.layoutVertex4(this.graph.nodeMap.get(this.rootId));
        // const lineMap = this.layoutVertex5(this.graph.nodeMap.get(this.rootId));
        // const lineMap = this.layoutVertex6(this.graph.nodeMap.get(this.rootId));
        const lineMap = this.layoutVertex7(this.graph.nodeMap.get(this.rootId));
        for (const nodeId of lineMap.keys()) {
            const line = lineMap.get(nodeId);
            const node = this.graph.nodeMap.get(nodeId);
            node.data.y = line;
        }
    }

    /**
     * Overlapped last + optimized parent place
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex1(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.sort((node0, node1) => {
            const isOverlapped0 = this.isOverlapped(node0, node),
                  isOverlapped1 = this.isOverlapped(node1, node);
            if (isOverlapped0 && isOverlapped1) {
                return node0.data.x1 - node1.data.x1;
            }
            if (isOverlapped0) {
                return 1;
            }
            if (isOverlapped1) {
                return -1;
            }
            // return node0.data.x0 - node1.data.x0;
            return 0;
        });

        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // merge line result
            const lastValidLine = localLineMap.get(child.id);
            const subLineMap = this.layoutVertex1(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lastValidLine;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const childrenLines = children.map(c => localLineMap.get(c.id));
        const start = Math.floor(childrenLines.reduce((sum, item) => sum + item, 0) / children.length);
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let nodeLine = -1;
        for(let i = start; i >= 0; --i) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            })
            if (isValid) {
                nodeLine = i;
                break;
            }
        }
        if (nodeLine === -1) {
            for(let i = start + 1; i <= maxLine; ++i) {      // i is lineIdx as well
                const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
                const isValid = allocatedNodeIdList.every(nodeId => {
                    const testNode = this.graph.nodeMap.get(nodeId);
                    return !this.isOverlapped(testNode, node);
                })
                if (isValid) {
                    nodeLine = i;
                    break;
                }
            }
            if (nodeLine === -1) {
                if (this.isOverlapped(children[children.length - 1], node)) {
                    nodeLine = 0;
                    [...localLineMap.keys()].forEach(precursorId => {
                        localLineMap.set(precursorId, localLineMap.get(precursorId) + 1);
                    });
                } else {
                    nodeLine = maxLine + 1;
                }
            }
        }
        localLineMap.set(node.id, nodeLine);

        return localLineMap;
    }

    /**
     * Overlapped first + optimized parent place
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex2(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.sort((node0, node1) => {
            const isOverlapped0 = this.isOverlapped(node0, node),
                  isOverlapped1 = this.isOverlapped(node1, node);
            if (isOverlapped0 && isOverlapped1) {
                return - node0.data.x1 + node1.data.x1;
            }
            if (isOverlapped0) {
                return -1;
            }
            if (isOverlapped1) {
                return 1;
            }
            // return node0.data.x0 - node1.data.x0;
            return 0;
        });

        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // merge line result
            const lastValidLine = localLineMap.get(child.id);
            const subLineMap = this.layoutVertex2(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lastValidLine;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const childrenLines = children.map(c => localLineMap.get(c.id));
        let start = Math.floor(childrenLines.reduce((sum, item) => sum + item, 0) / children.length);
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let nodeLine = -1;

        for(let i = start + 1; i <= maxLine; ++i) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            })
            if (isValid) {
                nodeLine = i;
                break;
            }
        }
        if (nodeLine === -1) {
            for(let i = start; i >= 0; --i) {      // i is lineIdx as well
                const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
                const isValid = allocatedNodeIdList.every(nodeId => {
                    const testNode = this.graph.nodeMap.get(nodeId);
                    return !this.isOverlapped(testNode, node);
                })
                if (isValid) {
                    nodeLine = i;
                    break;
                }
            }
            if (nodeLine === -1) {
                nodeLine = maxLine + 1;
            }
        }
        localLineMap.set(node.id, nodeLine);

        return localLineMap;
    }

    /**
     * Subtree start first + optimized parent place
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex3(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // merge line result
            const lastValidLine = localLineMap.get(child.id);
            const subLineMap = this.layoutVertex3(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lastValidLine;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const childrenLines = children.map(c => localLineMap.get(c.id));
        let start = Math.floor(childrenLines.reduce((sum, item) => sum + item, 0) / children.length);
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let nodeLine = -1;

        for(let i = start + 1; i <= maxLine; ++i) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            })
            if (isValid) {
                nodeLine = i;
                break;
            }
        }
        if (nodeLine === -1) {
            for(let i = start; i >= 0; --i) {      // i is lineIdx as well
                const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
                const isValid = allocatedNodeIdList.every(nodeId => {
                    const testNode = this.graph.nodeMap.get(nodeId);
                    return !this.isOverlapped(testNode, node);
                })
                if (isValid) {
                    nodeLine = i;
                    break;
                }
            }
            if (nodeLine === -1) {
                nodeLine = maxLine + 1;
            }
        }
        localLineMap.set(node.id, nodeLine);

        return localLineMap;
    }

    /**
     * Overlapped last
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex4(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.sort((node0, node1) => {
            const isOverlapped0 = this.isOverlapped(node0, node),
                isOverlapped1 = this.isOverlapped(node1, node);
            if (isOverlapped0 && isOverlapped1) {
                return node0.data.x1 - node1.data.x1;
            }
            if (isOverlapped0) {
                return 1;
            }
            if (isOverlapped1) {
                return -1;
            }
            // return node0.data.x0 - node1.data.x0;
            return 0;
        });

        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // merge line result
            const lastValidLine = localLineMap.get(child.id);
            const subLineMap = this.layoutVertex4(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lastValidLine;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let nodeLine = -1;
        for(let i = 0; i <= maxLine; ++i) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            })
            if (isValid) {
                nodeLine = i;
                break;
            }
        }
        if (nodeLine === -1) {
            if (this.isOverlapped(children[children.length - 1], node)) {
                nodeLine = 0;
                [...localLineMap.keys()].forEach(precursorId => {
                    localLineMap.set(precursorId, localLineMap.get(precursorId) + 1);
                });
            } else {
                nodeLine = maxLine + 1;
            }
        }
        localLineMap.set(node.id, nodeLine);

        return localLineMap;
    }

    /**
     * Overlapped first
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex5(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.sort((node0, node1) => {
            const isOverlapped0 = this.isOverlapped(node0, node),
                isOverlapped1 = this.isOverlapped(node1, node);
            if (isOverlapped0 && isOverlapped1) {
                return - node0.data.x1 + node1.data.x1;
            }
            if (isOverlapped0) {
                return -1;
            }
            if (isOverlapped1) {
                return 1;
            }
            // return node0.data.x0 - node1.data.x0;
            return 0;
        });

        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // merge line result
            const lastValidLine = localLineMap.get(child.id);
            const subLineMap = this.layoutVertex5(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lastValidLine;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let nodeLine = -1;
        for(let i = 0; i <= maxLine; ++i) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            })
            if (isValid) {
                nodeLine = i;
                break;
            }
        }
        if (nodeLine === -1) {
            nodeLine = maxLine + 1;
        }
        localLineMap.set(node.id, nodeLine);

        return localLineMap;
    }

    /**
     * Subtree start first
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex6(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // merge line result
            const lastValidLine = localLineMap.get(child.id);
            const subLineMap = this.layoutVertex6(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lastValidLine;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let nodeLine = -1;
        for(let i = 0; i <= maxLine; ++i) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(i) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            })
            if (isValid) {
                nodeLine = i;
                break;
            }
        }
        if (nodeLine === -1) {
            nodeLine = maxLine + 1;
        }
        localLineMap.set(node.id, nodeLine);

        return localLineMap;
    }

    /**
     * Subtree start first + score-based root place
     *
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @returns {Map<(number|string), number>}
     */
    layoutVertex7(node) {
        const localLineMap = new Map();
        const children = node.inEdges
            .filter(e => !this.hiddenEdgeSet.has(e))
            .map(e => e.src);
        children.forEach((child, i) => localLineMap.set(child.id, i));

        if (children.length === 0) {
            localLineMap.set(node.id, 0);
            return localLineMap;
        }

        for(let i = 0; i < children.length; ++i) {
            const child = children[i];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // layout child
            const subLineMap = this.layoutVertex7(child);
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());
            const subLineCnt = subMaxLine - subMinLine + 1;

            // compute and optimize line offset
            const lineOffset = localLineMap.get(child.id);
            // if (i !== 0) {
            //     const lastChildLine = localLineMap.get(children[i - 1].id);
            //     const curChildLineInSubLineMap = subLineMap.get(child.id);
            //     while (curChildLineInSubLineMap) {
            //         const newLine = curChildLineInSubLineMap - subMinLine + lineOffset;
            //         if (newLine <= lastChildLine) {
            //             break;
            //         }
            //
            //     }
            // }

            // merge line result
            // map [subMinLine, subMaxLine] -> [lastValidLine, lastValidLine + subLineCnt - 1]
            for (const precursorId of subLineMap.keys()) {
                const oldLine = subLineMap.get(precursorId);
                const newLine = oldLine - subMinLine + lineOffset;
                localLineMap.set(precursorId, newLine);
            }
            for (let j = i + 1; j < children.length; j++) {
                const child = children[j];
                const oldLine = localLineMap.get(child.id);
                const newLine = oldLine + subLineCnt - 1;
                localLineMap.set(child.id, newLine);
            }
        }

        // find a line for current node
        const maxLine = Math.max(...localLineMap.values());
        const line2NodeIdList = new Map();
        for (const precursorId of localLineMap.keys()) {
            const line = localLineMap.get(precursorId);
            if (line2NodeIdList.has(line)) {
                line2NodeIdList.get(line).push(precursorId);
            } else {
                line2NodeIdList.set(line, [precursorId]);
            }
        }

        let minScore = Infinity;
        let bestLine = -1;
        let bestGroups = null;
        for(let testLine = 0; testLine <= maxLine + 1; ++testLine) {      // i is lineIdx as well
            const allocatedNodeIdList = line2NodeIdList.get(testLine) ?? [];
            const isValid = allocatedNodeIdList.every(nodeId => {
                const testNode = this.graph.nodeMap.get(nodeId);
                return !this.isOverlapped(testNode, node);
            });
            if (!isValid) {
                continue;
            }
            // compute score
            const groups = this.computeChildrenGroups(localLineMap, node, children, testLine);
            let cost = 0;
            groups.forEach((group, i) => {
                if (group.length === 0) {
                    return;
                }
                const maxEnd = Math.max(...group.map(child => child.data.x1));
                group.forEach(child => {
                    cost += this.computeEdgeCost(child.data.x1, localLineMap.get(child.id), maxEnd, testLine);
                });
                if (i === 1) {      // middle part
                    cost += this.computeEdgeCost(maxEnd, testLine, node.data.x0, testLine);
                }
            });
            if (cost < minScore) {
                minScore = cost;
                bestLine = testLine;
                bestGroups = groups;
            }
        }
        if (bestLine === -1) {
            console.error('layout error', this, node);
        }
        localLineMap.set(node.id, bestLine);

        // set edge turning point
        bestGroups.forEach((group, i) => {
            let turningX;
            if (i === 1) {      // middle part
                turningX = node.data.x0 - this.gapPixel / 2;
            } else {
                const maxEnd = Math.max(...group.map(child => child.data.x1));
                turningX = Math.min(maxEnd + this.gapPixel / 2, node.data.x1);
            }
            group.forEach(child => {
                const edge = this.graph.edgeMap.get(Edge.getEdgeId(child, node));
                if (!this.hiddenEdgeSet.has(edge)) {
                    edge.data.turningX = turningX;
                }
            });
        });

        // compress gap be

        return localLineMap;
    }

    /**
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node0
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node1
     * @returns {boolean}
     */
    isOverlapped(node0, node1) {
        const start0 = node0.data.x0, end0 = node0.data.x1;
        const start1 = node1.data.x0, end1 = node1.data.x1;
        return (start0 <= start1 && start1 <= end0 + this.gapPixel)
            || (start1 <= start0 && start0 <= end1 + this.gapPixel);
    }

    /**
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node0
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node1
     * @returns {boolean}
     */
    isOverlappedConsiderTurningX(node0, node1) {
        let start0 = node0.data.x0, end0 = node0.data.x1;
        let start1 = node1.data.x0, end1 = node1.data.x1;
        node0.outEdges.forEach(e => {
            if (e.turningX && end0 < e.turningX) {
                end0 = e.turningX;
            }
        });
        node1.outEdges.forEach(e => {
            if (e.turningX && end1 < e.turningX) {
                end1 = e.turningX;
            }
        });
        return (start0 <= start1 && start1 <= end0 + this.gapPixel)
            || (start1 <= start0 && start0 <= end1 + this.gapPixel);
    }

    // setCtrlPoints() {
    //     this.graph.nodes.forEach(node => {
    //         node.inEdges.forEach(e => {
    //             if (this.hiddenEdgeSet.has(e)) {
    //                 return;
    //             }
    //             const x = e.dst.data.x0 - this.gapPixel / 2;
    //             const line = e.dst.data.y;
    //             e.data.ctrlPoints.push([x, line]);
    //         });
    //     });
    // }

    /**
     * @param {Map<number|string, number>} lineMap
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} node
     * @param {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>[]} children
     * @param {number} optionalLine Node can be put here
     * @returns {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>[][]}
     */
    computeChildrenGroups(lineMap, node, children, optionalLine) {
        const overlappedChildren = children.filter(child => this.isOverlapped(node, child));

        // find last overlapped child above optional line
        const overlappedChildrenAbove = overlappedChildren.filter(child => lineMap.get(child.id) < optionalLine);
        const lastOverlappedAbove = overlappedChildrenAbove[overlappedChildrenAbove.length - 1] ?? null;

        // find first overlapped child below optional line
        const overlappedChildrenBelow = overlappedChildren.filter(child => lineMap.get(child.id) > optionalLine);
        const firstOverlappedBelow = overlappedChildrenBelow[0] ?? null;

        // [0,segIndex0), [segIndex0,segIndex1), [segIndex1,len)
        let segIndex0 = 0, segIndex1 = children.length;
        if (lastOverlappedAbove !== null) {
            segIndex0 = children.indexOf(lastOverlappedAbove) + 1;
        }
        if (firstOverlappedBelow !== null) {
            segIndex1 = children.indexOf(firstOverlappedBelow);
        }
        const group0 = children.filter((_, i) => i < segIndex0);
        const group1 = children.filter((_, i) => segIndex0 <= i && i < segIndex1);
        const group2 = children.filter((_, i) => segIndex1 <= i);

        return [group0, group1, group2];
    }

    computeEdgeCost(srcX, srcY, dstX, dstY) {
        let cost = 0;
        cost += Math.abs(srcX - dstX) / this.gapPixel * X_FACTOR;
        cost += Math.abs(srcY - dstY) * Y_FACTOR * (1 + Y_UP_PENALTY * (srcY <= dstY ? 0 : 1));
        // cost += -Math.abs(srcX - dstX) / this.gapPixel * X_IMPORTANCE;
        return cost;
    }
}

const X_FACTOR = 1;
const Y_FACTOR = 1;
const Y_UP_PENALTY = 0.05;
// const X_IMPORTANCE = 1;
