/* eslint-disable */

import {Edge} from "@/utils/utils/graph";
import {MapUtils} from "@/utils/utils/MapUtils";
import {ArrayUtils} from "@/utils/utils/ArrayUtils";

/**
 * @typedef {import('@/utils/utils/graph').Node<VertexLayoutData, EdgeLayoutData>} TreeLayoutAlgo~Node
 */

export class TreeLayoutAlgo {
    rootId
    /** @type {Graph<VertexLayoutData, EdgeLayoutData>} */
    graph
    gapPixel

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
        // console.log(this.gapPixel);
    }

    solve() {
        this.computeHiddenEdgeSet();
        this.reorderInAndOutEdges();
        this.setLines();
    }

    computeHiddenEdgeSet() {
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
                    e.data.isHidden = true;
                }
            });
        });
    }

    reorderInAndOutEdges() {
        const subTreeStartMap = new Map();
        this.visitedSet = new Set();
        /**
         * @param {TreeLayoutAlgo~Node} node
         * @returns {number}
         */
        const processSubTreeStart = (node) => {
            if (this.visitedSet.has(node.id)) {
                return Infinity;
            }
            this.visitedSet.add(node.id);

            let start = node.data.x0 ?? Infinity;
            node.inEdges
                .filter(e => !e.data.isHidden)
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
        const {lineMap} = this.layoutVertex(this.graph.nodeMap.get(this.rootId));
        for (const nodeId of lineMap.keys()) {
            const line = lineMap.get(nodeId);
            const node = this.graph.nodeMap.get(nodeId);
            node.data.y = line;
        }
    }

    /**
     * @typedef {Object} RecursionReturnObject
     * @property {Map<(number|string), number>} lineMap
     * @property {Map<number, TreeLayoutAlgo~Node[]>} blocksMap
     */

    /**
     * Subtree start first + score-based root place + compress
     *
     * @param {TreeLayoutAlgo~Node} node
     * @returns {RecursionReturnObject}
     */
    layoutVertex(node) {
        /** @type {Map<(number|string), number>} */
        const localLineMap = new Map();
        /** @type {Map<number, TreeLayoutAlgo~Node[]>} */
        const localBlocksMap = new Map();

        /** @type {TreeLayoutAlgo~Node[]} */
        const children = node.inEdges
            .filter(e => !e.data.isHidden)
            .map(e => e.src);

        if (children.length === 0) {
            if (node.data.toRender) {
                localLineMap.set(node.id, 0);
                const blocks = MapUtils.computeIfAbsent(localBlocksMap, 0, () => []);
                blocks.push(node);
            }
            return {lineMap: localLineMap, blocksMap: localBlocksMap};
        }

        let lastValidChild = null;
        let lastValidResultObject = null;

        let childStartLine = 0;
        for(let childIdx = 0; childIdx < children.length; ++childIdx) {
            const child = children[childIdx];

            if (this.visitedSet.has(child.id)) {
                continue;
            }
            this.visitedSet.add(child.id);

            // layout child
            const {lineMap: subLineMap, blocksMap: subBlocksMap} = this.layoutVertex(child);
            if (subLineMap.size === 0) {
                continue;
            }
            const subMinLine = Math.min(...subLineMap.values());
            const subMaxLine = Math.max(...subLineMap.values());

            // compute and optimize line offset
            let compressedStartLine = childStartLine;
            if (lastValidChild !== null) {
                const lastChildLine = localLineMap.get(lastValidChild.id);
                const curChildLineInSub = subLineMap.get(child.id);
                let validStartLine = compressedStartLine;     // the smallest valid line
                let testStartLine = compressedStartLine;      // the candidate for test
                increaseLineOffset:
                while (true) {
                    --testStartLine;        // try to move up
                    const sub2Local = lineInSub => lineInSub - subMinLine + testStartLine;
                    const local2Sub = lineInLocal => lineInLocal + subMinLine - testStartLine;
                    // check whether last child is above
                    if (sub2Local(curChildLineInSub) <= lastChildLine) {
                        break;
                    }
                    for (let testLine = sub2Local(subMinLine); testLine < childStartLine; testLine++) {
                        const blocks0 = localBlocksMap.get(testLine) ?? [];   // can't be null
                        // children blocks haven't set into local scope
                        const blocks1 = subBlocksMap.get(local2Sub(testLine)) ?? [];
                        for (const b0 of blocks0) {
                            for (const b1 of blocks1) {
                                if (this.isOverlappedConsiderTurningX(b0, b1)) {
                                    break increaseLineOffset;
                                }
                                // a special case: b0 is lastChild
                                if (lastValidChild === b0 && b1.data.turningX < b0.data.x0) {
                                    // b1.data.turningX !== null, as it is a precursor of cur child.
                                    break increaseLineOffset;
                                }
                            }
                        }
                    }
                    validStartLine = testStartLine;
                }
                compressedStartLine = validStartLine;
            }

            /* merge line result */

            // subLineCnt = subMaxLine - subMinLine + 1;
            // map [subMinLine, subMaxLine] -> [compressedStartLine, compressedStartLine + subLineCnt - 1]
            const sub2Local = lineInSub => lineInSub - subMinLine + compressedStartLine;

            // update local line map
            for (const [precursorId, lineInSub] of subLineMap.entries()) {
                const lineInLocal = sub2Local(lineInSub);
                localLineMap.set(precursorId, lineInLocal);
            }

            // update local blocks map
            for (const [lineInSub, subBlocks] of subBlocksMap.entries()) {
                const lineInLocal = sub2Local(lineInSub);
                const blocks = MapUtils.computeIfAbsent(localBlocksMap, lineInLocal, () => []);
                blocks.push(...subBlocks);
                // blocks.sort((b0, b1) => b0.data.x0 - b0.data.x1);
            }

            // update childStartLine
            childStartLine = sub2Local(subMaxLine) + 1;

            lastValidChild = child;
            lastValidResultObject = {lineMap: subLineMap, blocksMap: subBlocksMap};
        }

        /* find a line for current node */

        if (node.data.toRender) {
            const maxLine = Math.max(...localLineMap.values());
            let minScore = Infinity;
            let bestLine = -2;

            /** @type {TreeLayoutAlgo~Node[][] | null} */
            let bestGroups = null;
            for(let testLine = -1; testLine <= maxLine + 1; ++testLine) {      // i is lineIdx as well
                // const blocks = MapUtils.computeIfAbsent(localBlocksMap, testLine, () => []);
                const blocks = localBlocksMap.get(testLine) ?? [];
                const isValid = blocks.every(testNode => {
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
                        cost += this.computeEdgeCost(child.data.x1, localLineMap.get(child.id),
                            maxEnd + this.gapPixel, testLine);
                    });
                    if (i === 1) {      // middle part
                        cost += this.computeEdgeCost(maxEnd, testLine, node.data.x0, testLine);
                    }
                });
                const childCenterY = children.reduce((sum, child) => {
                    return sum + localLineMap.get(child.id);
                }, 0) / children.length;
                cost += Math.abs(childCenterY - testLine) * children.length * CHILD_CENTER_Y_DIST_PENALTY;

                if (groups[0].length !== 0
                    && Math.min(...groups[0].map(child => child.data.x0)) > node.data.x0) {
                    cost += Infinity;
                }

                if (cost < minScore) {
                    minScore = cost;
                    bestLine = testLine;
                    bestGroups = groups;
                }
            }
            if (bestLine === -2) {
                console.error('layout error', this, node);
            }
            if (bestLine === -1) {
                bestLine = 0;
                for (const [precursorId, line] of localLineMap.entries()) {
                    localLineMap.set(precursorId, line + 1);
                }
                const tempMap = new Map();
                localBlocksMap.forEach((value, key) => tempMap.set(key, value));
                localBlocksMap.clear();
                tempMap.forEach((blocks, line) => {
                    localBlocksMap.set(line + 1, blocks);
                });
            }

            // console.log('last choice', bestLine);
            localLineMap.set(node.id, bestLine);
            MapUtils.computeIfAbsent(localBlocksMap, bestLine, () => []).push(node);

            /* set edge turning point */

            bestGroups.forEach((group, i) => {
                let turningX;
                const maxEnd = Math.max(...group.map(child => child.data.x1));
                turningX = Math.min(maxEnd + this.gapPixel / 2, node.data.x1);
                group.forEach(child => {
                    const edge = this.graph.edgeMap.get(Edge.getEdgeId(child, node));
                    if (!edge.data.isHidden) {
                        if (bestLine === localLineMap.get(child.id)) {      // on the same line
                            edge.data.turningX = node.data.x0;
                        } else if (i === 1) {       // middle group
                            // basic solution
                            // edge.data.turningX = node.data.x0 - this.gapPixel;
                            // basic solution 2
                            // edge.data.turningX = (turningX + node.data.x0) / 2;

                            // optimized solution (slow)
                            /** @type {TreeLayoutAlgo~Node[]} */
                            const lastNodesInEachLine = [];
                            const start = localLineMap.get(child.id);
                            for (let line = Math.min(start, bestLine); line <= Math.max(start,bestLine); ++line) {
                                const nodesOnTheLeft = localBlocksMap.get(line)
                                    .filter(b => b.data.x0 < node.data.x0);
                                const lastNode = ArrayUtils.findMax(nodesOnTheLeft,
                                    (p, q) => p.data.x0 - q.data.x0);
                                if (lastNode) {
                                    lastNodesInEachLine.push(lastNode);
                                }
                            }
                            let endPoint = maxEnd;
                            // console.log(node.data.vertexIdList[0], lastNodesInEachLine, localLineMap.get(child.id), bestLine);
                            if (lastNodesInEachLine.length > 0) {
                                /** @type {number[]} */
                                const endPoints = lastNodesInEachLine.map(precursor => {
                                    const edge = precursor.outEdges.find(e => !e.data.isHidden);
                                    if (edge.data.turningX && edge.dst !== node) {
                                        return edge.data.turningX;
                                    } else {
                                        return precursor.data.x1;
                                    }
                                });
                                endPoint = Math.max(...endPoints) + this.gapPixel / 2;
                            }
                            edge.data.turningX = (endPoint + node.data.x0) / 2;
                        } else {
                            edge.data.turningX = turningX;
                        }
                    }
                });
            });

        } else {
            // not to render this node
            let nodeWithMaxEnd = null;
            for (const precursorId of localLineMap.keys()) {
                const precursor = this.graph.nodeMap.get(precursorId);
                if (nodeWithMaxEnd === null || precursor.data.x1 > nodeWithMaxEnd.data.x1) {
                    nodeWithMaxEnd = precursor;
                }
            }
            if (nodeWithMaxEnd !== null) {      // localLineMap.size !== 0
                node.data.x0 = node.data.x1 = nodeWithMaxEnd.data.x1;
                const line = localLineMap.get(nodeWithMaxEnd.id);

                // console.log('last choice', bestLine);
                localLineMap.set(node.id, line);
                MapUtils.computeIfAbsent(localBlocksMap, line, () => []).push(node);

                /* set edge turning point */
                children.forEach(child => {
                    const edge = this.graph.edgeMap.get(Edge.getEdgeId(child, node));
                    edge.data.turningX = node.data.x0;
                });
            }
        }

        return {lineMap: localLineMap, blocksMap: localBlocksMap};
    }

    /**
     * @param {TreeLayoutAlgo~Node} node0
     * @param {TreeLayoutAlgo~Node} node1
     * @returns {boolean}
     */
    isOverlapped(node0, node1) {
        const start0 = node0.data.x0, end0 = node0.data.x1 + this.gapPixel;
        const start1 = node1.data.x0, end1 = node1.data.x1 + this.gapPixel;
        return !(end0 < start1 || start0 > end1);
    }

    /**
     * @param {TreeLayoutAlgo~Node} node0
     * @param {TreeLayoutAlgo~Node} node1
     * @returns {boolean}
     */
    isOverlappedConsiderTurningX(node0, node1) {
        let start0 = node0.data.x0, end0 = node0.data.x1 + this.gapPixel;
        let start1 = node1.data.x0, end1 = node1.data.x1 + this.gapPixel;
        node0.outEdges.forEach(e => {
            if (e.data.turningX && end0 < e.data.turningX) {
                end0 = e.data.turningX;
            }
        });
        node1.outEdges.forEach(e => {
            if (e.data.turningX && end1 < e.data.turningX) {
                end1 = e.data.turningX;
            }
        });
        return !(end0 < start1 || start0 > end1);
    }

    /**
     * @param {Map<number|string, number>} lineMap
     * @param {TreeLayoutAlgo~Node} node
     * @param {TreeLayoutAlgo~Node[]} children
     * @param {number} optionalLine Node can be put here
     * @returns {TreeLayoutAlgo~Node[][]}
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
        cost += Math.abs(srcY - dstY) * (Y_FACTOR + Y_UP_PENALTY * (srcY <= dstY ? 0 : 1));
        return cost;
    }
}

const X_FACTOR = 1;
const Y_FACTOR = 1;
const Y_UP_PENALTY = 0.05;
const CHILD_CENTER_Y_DIST_PENALTY = 0.04;
// const CHILD_CENTER_Y_DIST_PENALTY = 0;
