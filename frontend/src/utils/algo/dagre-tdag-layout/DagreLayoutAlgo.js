/* eslint-disable */

import dagre from "dagre";
import {Node} from "@/utils/algo/dagre-tdag-layout/Node"
import {Edge} from "@/utils/algo/dagre-tdag-layout/Edge";
import {Tick} from "@/utils/algo/dagre-tdag-layout/Tick";
import {VirtualNode} from "@/utils/algo/dagre-tdag-layout/VirtualNode";
import {VirtualEdge} from "@/utils/algo/dagre-tdag-layout/VirtualEdge";
import * as d3 from "d3";

export class DagreLayoutAlgo {
    /** @type {Node[]} */
    nodes = []
    /** @type {Map<(string|number), Node>} */
    nodeMap = new Map()
    /** @type {Edge[]} */
    edges = []

    /** @type {Tick[]} Tick array order by rank */
    ticks

    /** @type {VirtualNode[]} */
    vNodes
    /** @type {VirtualEdge[]} */
    vEdges

    gapPixel
    layoutConfig

    dagreGraph

    /** @type {Map<number, number>} */
    rankToX

    /** @type {Map<(number|string), object>} */
    nodeLayoutMap
    /**
     * @type {Map<string, number[][]>}
     * The edge id is srdNodeId-dstNodeId
     */
    edgeLayoutMap


    constructor(gapPixel, layoutConfig) {
        this.gapPixel = gapPixel
        this.layoutConfig = layoutConfig
    }

    setNode(id, x0, x1) {
        if (x0 === x1) {
            x1 += 1
        }
        console.log(x0, x1)
        let node = new Node(id, x0, x1)
        this.nodes.push(node)
        this.nodeMap.set(id, node)
    }

    setEdge(id1, id2) {
        let node1 = this.nodeMap.get(id1)
        let node2 = this.nodeMap.get(id2)
        if (!node1 || !node2) {
            console.error("No such node.", this.nodeMap, id1, id2)
        }
        let edge = new Edge(node1, node2)
        this.edges.push(edge)
        node1.outEdges.push(edge)
        node2.inEdges.push(edge)
    }

    solve() {
        console.log('dagre layout obj', this)
        this.computeTicks()
        this.createVirtualGraph()
        this.layoutGraph()
        this.computeLayoutMap()

        // this.drawToTestSVG()
    }

    computeTicks() {
        let ticks = this.ticks = []
        let id = 0
        this.nodes.forEach(node => {
            let t1 = new Tick(id++, node, 'start'),
                t2 = new Tick(id++, node, 'end')
            ticks.push(t1, t2)
            node.ticks.push(t1, t2)
        })
        ticks.sort((t0, t1) => t0.getX() - t1.getX())
        ticks.forEach((it, rank) => it.rank = rank)
    }

    createVirtualGraph() {
        this.vNodes = []
        this.vEdges = []

        // vNodes

        let runningNodeMap = new Map()
        let vNodeId = 0
        this.ticks.forEach(tick => {
            if (tick.type === 'start') {
                runningNodeMap.set(tick.node.id, tick.node)
            }
            for (let node of runningNodeMap.values()) {
                let vNode = new VirtualNode(vNodeId++, tick.rank, node)
                node.vNodes.push(vNode)
                this.vNodes.push(vNode)
            }
            if (tick.type === 'end') {
                runningNodeMap.delete(tick.node.id)
            }
        })

        // vEdges

        this.nodes.filter(n => n.inEdges.length === 0)
            .forEach(n => {
                // add a dumb node in the front of all nodes with in-degree = 0
                let dumbNode = new VirtualNode(this.vNodes.length, -1, null)
                this.vNodes.push(dumbNode)

                let src = dumbNode, dst = n.vNodes[0]
                let vEdge = new VirtualEdge(src, dst)
                src.outVEdges.push(vEdge)
                dst.inVEdges.push(vEdge)
                this.vEdges.push(vEdge)
            })

        // vEdges that across each real node
        this.edges.forEach(e => {
            let vVNodes = e.v.vNodes, wVNodes = e.w.vNodes
            let wVNodeIdx = 0
            let src = vVNodes[vVNodes.length - 1], dst = wVNodes[wVNodeIdx]
            while (dst.rank <= src.rank) {
                dst = wVNodes[++wVNodeIdx]
            }
            // console.log(src, dst, e)
            let vEdge = new VirtualEdge(src, dst, e)
            src.outVEdges.push(vEdge)
            dst.inVEdges.push(vEdge)
            this.vEdges.push(vEdge)
        })

        // vEdges that in the real node
        this.nodes.forEach(n => {
            for (let i = 0; i < n.vNodes.length - 1; ++i) {
                let src = n.vNodes[i], dst = n.vNodes[i + 1]
                let vEdge = new VirtualEdge(src, dst)
                src.outVEdges.push(vEdge)
                dst.inVEdges.push(vEdge)
                this.vEdges.push(vEdge)
            }
        })
    }

    layoutGraph() {
        // Create the input graph
        let g = new dagre.graphlib.Graph({compound: true})
            .setGraph({})
            .setDefaultEdgeLabel(() => {
            })

        g.graph().rankDir = 'LR';
        g.graph().align = 'UL';
        g.graph().nodesep = '20';
        g.graph().edgesep = '10';
        g.graph().ranksep = '10';
        g.graph().marginy = '10';
        g.graph().marginx = '10';

        this.vNodes.forEach(vNode => {
            vNode.height = 100
            vNode.width = 1
            g.setNode(vNode.id, vNode);
        })

        // set the parent node
        this.nodes.forEach(node => {
            g.setNode('node' + node.id, {label: node.id, height: 100})
        })

        this.nodes.forEach(node => {
            node.vNodes.forEach(vNode => {
                g.setParent(vNode.id, 'node' + node.id)
            })
        })

        this.vEdges.forEach(vEdge => {
            let minLen = vEdge.w.rank - vEdge.v.rank
            g.setEdge(vEdge.v.id, vEdge.w.id, {minLen: minLen})
        })

        dagre.layout(g)

        this.dagreGraph = g
    }

    computeLayoutMap() {
        this.nodeLayoutMap = new Map()
        this.nodes.forEach(node => {
            let firstVNode = node.vNodes[0]
            this.nodeLayoutMap.set(node.id, {
                x0: node.x0,
                x1: node.x1,
                y: this.dagreGraph.node(firstVNode.id).y
            })
        })

        this.rankToX = new Map()
        this.vNodes.forEach(vNode => {
            let dagreNode = this.dagreGraph.node(vNode.id)
            this.rankToX.set(vNode.rank, dagreNode.x)
        })

        this.edgeLayoutMap = new Map()
        this.vEdges
            .filter(vEdge => !!vEdge.realEdge)
            .forEach(vEdge => {
                let points = this.dagreGraph.edge({v: vEdge.v.id, w: vEdge.w.id}).points
                points = this.fixPoints(vEdge, Object.create(points))
                let rEdge = vEdge.realEdge
                this.edgeLayoutMap.set(`${rEdge.v.id}-${rEdge.w.id}`, points)
            })
    }

    fixPoints(edge, points) {
        points.forEach(point => {
            point.x = this.transformX(point.x)
        })

        let xScale = d3.scaleLinear()
            .domain(d3.extent(points, p => p.x))
            .range([edge.v.x, Math.max(edge.v.x, edge.w.x)])
        let yScale = d3.scaleLinear()
            .domain(d3.extent(points, p => p.y))
            .range([edge.v.y, edge.w.y])
        points.forEach(p => {
            p.x = xScale(p.x)
            p.y = yScale(p.y)
        })

        return points
    }

    transformX(x) {
        let lo = 0, hi = this.ticks.length - 1
        // must between min max tick time
        while (lo <= hi) {
            let mi = Math.floor((lo + hi) / 2)
            let value = this.rankToX.get(mi)
            if (value <= x) {
                lo = mi + 1
            } else {
                hi = mi - 1
            }
        }
        // now hi is the index of the last rank that rank.x <= x
        let r0 = hi, r1 = hi + 1
        let x0 = this.rankToX.get(r0)
        let tranX0 = this.ticks[r0].getX(),
            tranX1 = this.ticks[r1].getX()
        return tranX0 + (tranX1 - tranX0) * (x - x0)
    }

    drawToTestSVG() {
        // Set up an SVG group so that we can translate the final graph.
        let svg = d3.select("#test-svg")
            .attr('height', 800).attr('width', 1200)
        let svgGroup = svg.append("g");

        let gs = svgGroup.selectAll('g').data(this.vNodes).enter().append('g')

        gs.append('rect')
            .attr('transform', d => 'translate(' + [d.x, d.y] + ')')
            .attr('height', 15).attr('width', 5)

        gs.append('text').text(d => d.id)
            .attr('x', d => d.x)
            .attr('y', d => d.y)

        let edgeGrp = svgGroup.append('g')
        let lineGen = d3.line().x(p => p.x).y(p => p.y)//.curve(d3.curveBasis)
        edgeGrp.selectAll('g').data(this.vEdges).enter().append('path')
            .attr('d', e => {
                let points = this.dagreGraph.edge({v: e.v.id, w: e.w.id}).points
                if (e.realEdge) {
                    // let originX = this.rankToX.get(e.v.rank),
                    //     originY = e.v.y
                    // let offsetX = points[0].x - originX,
                    //     offsetY = points[0].y - originY
                    // points.forEach(p => {
                    //   p.x -= offsetX
                    //   p.y -= offsetY
                    // })
                    // console.log('>> ', offsetX, offsetY)

                    let xScale = d3.scaleLinear()
                        .domain(d3.extent(points, p => p.x))
                        .range([e.v.x, e.w.x])
                    let yScale = d3.scaleLinear()
                        .domain(d3.extent(points, p => p.y))
                        .range([e.v.y, e.w.y])
                    points.forEach(p => {
                        p.x = xScale(p.x)
                        p.y = yScale(p.y)
                    })
                }
                return lineGen(points)
            })
            .attr('stroke-width', 1)
            .attr('stroke', 'grey')
            .attr('fill', 'none')
        edgeGrp.attr('transform', 'translate(' + [1, 7] + ')')

// Center the graph
        var xCenterOffset = (svg.attr("width") - this.dagreGraph.graph().width) / 2;
        svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
        svg.attr("height", this.dagreGraph.graph().height + 40);

        let nodeGrp = svgGroup.append('g')
        nodeGrp.selectAll('g').data(this.nodes).enter().append('rect')
            .attr('x', node => node.vNodes[0].x)
            .attr('y', node => node.vNodes[0].y)
            .attr('width', node => {
                return node.vNodes[node.vNodes.length - 1].x - node.vNodes[0].x + 1
            })
            .attr('height', 20)
            .attr('fill', 'rgba(255,117,117,0.2)')

        var zoom = d3.zoom()
            .scaleExtent([-3, 8])
            .on('zoom', function () {
                svg.select('g').attr('transform', d3.event.transform);
            });
        svg.call(zoom);
    }

}
