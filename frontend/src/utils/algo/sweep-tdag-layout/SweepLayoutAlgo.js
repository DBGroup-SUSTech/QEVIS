import {Node} from "@/utils/algo/sweep-tdag-layout/Node"
import {Edge} from "@/utils/algo/sweep-tdag-layout/Edge";
import {Tick} from "@/utils/algo/sweep-tdag-layout/Tick";
import {VirtualNode} from "@/utils/algo/sweep-tdag-layout/VirtualNode";
import {VirtualEdge} from "@/utils/algo/sweep-tdag-layout/VirtualEdge";
import {RankPoint, RankPointType} from "./RankPoint";
import {isSameSequence} from "@/utils/utils/array/arrayUtils";

export class SweepLayoutAlgo {
  /** @type {Node[]} */
  nodes = []
  /** @type {Map<(string|number), Node>} */
  nodeMap = new Map()
  /** @type {Edge[]} */
  edges = []

  /** @type {Tick[]} Tick array order by rank */
  ticks

  /** @type {RankPoint[][]} */
  rpMatrix

  /** @type {VirtualNode[]} */
  vNodes
  /** @type {VirtualEdge[]} */
  vEdges

  /** @type {Map<number, number>} */
  rankToX

  /** @type {Map<(number|string), object>} */
  nodeLayoutMap

  maxSweepTime

  constructor(maxSweepTime=20) {
    this.maxSweepTime = maxSweepTime
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
    this.computeRpMatrix()
    this.layoutGraph()
    this.computeLayoutMap()
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

  computeRpMatrix() {
    this.rpMatrix = []

    let runningMap = new Map()
    let rpId = 0
    this.ticks.forEach(tick => {
      const rpCol = []
      if (tick.type === 'start') {
        runningMap.set('node-' + tick.node.id, {type: 'node', data: tick.node})
        tick.node.inEdges(inEdge => {
          runningMap.delete('edge-' + inEdge.id)
        })
      }
      for (let {type, data} of runningMap.values()) {
        let rp
        if (type === 'node') {
          if (tick.type === 'start' && tick.node === data) {
            rp = new RankPoint(rpId++, RankPointType.NODE_START)
          } else if (tick.type === 'end' && tick.node === data) {
            rp = new RankPoint(rpId++, RankPointType.NODE_END)
          } else {
            rp = new RankPoint(rpId++, RankPointType.NODE_INTER)
          }
        } else {    // is edge
          rp = new RankPoint(rpId++, RankPointType.EDGE_INTER)
        }
        rp.node = data
        rpCol.push(rp)
      }
      if (tick.type === 'end') {
        runningMap.delete('node-' + tick.node.id)
        tick.node.outEdges(outEdge => {
          runningMap.set('edge-' + outEdge.id, {type: 'edge', data: outEdge})
        })
      }

      this.rpMatrix.push(rpCol)
    })

    // link
    for (let colIdx = 0; colIdx < this.rpMatrix.length - 1; ++colIdx) {
      let col0 = this.rpMatrix[colIdx], col1 = this.rpMatrix[colIdx + 1]
      col0.forEach(rp0 => {
        let rp1List
        // six type
        if (rp0.type === RankPointType.NODE_START || rp0.type === RankPointType.NODE_INTER) {
          rp1List = col1.filter(rp1 => rp1.type === RankPointType.NODE_INTER || rp1.type === RankPointType.NODE_END)
        } else {
          rp1List = col1.filter(rp1 => rp1.type === RankPointType.EDGE_INTER || rp1.type === RankPointType.NODE_START)
        }
        rp1List.forEach(rp1 => {
          rp1.precursors.push(rp0)
          rp0.successors.push(rp1)
        })
      })
    }

  }

  layoutGraph(){
    let sweepCnt = 0
    while (sweepCnt++ <= this.maxSweepTime) {
      let noChange = true
      if (sweepCnt % 2 === 1) {   // left to right
        for (let colIdx = 0; colIdx < this.rpMatrix.length - 1; ++colIdx) {
          const col0 = this.rpMatrix[colIdx], col1 = this.rpMatrix[colIdx + 1]
          const col1Copy = [...col1]
          const newCol1 = this.getNewCol1(col0, col1Copy, true)
          if (!isSameSequence(col1, newCol1)) {
            noChange = false
            this.rpMatrix[colIdx + 1] = newCol1
          }
        }
      } else {    // right to left
        for (let colIdx = this.rpMatrix.length - 1; colIdx > 0; --colIdx) {
          const col0 = this.rpMatrix[colIdx], col1 = this.rpMatrix[colIdx - 1]
          const newCol1 = this.getNewCol1(col0, col1, false)
          if (!isSameSequence(col1, newCol1)) {
            noChange = false
            this.rpMatrix[colIdx - 1] = newCol1
          }
        }
      }
    }
  }

  /**
   * @param {RankPoint[]} col0
   * @param {RankPoint[]} col1
   * @param {boolean} leftToRight
   * @returns {RankPoint[]}
   */
  getNewCol1(col0, col1, leftToRight) {
    const newCol1 = []
    // add rp that can't exchange
    col1
      .filter(rp => rp.type === RankPointType.NODE_INTER
        || rp.type === RankPointType.NODE_END)
      .forEach(rp => newCol1.push(rp))
    // add rp that can exchange
    // add more related edges rp first
    col1
      .filter(rp => rp.type === RankPointType.EDGE_INTER
        || rp.type === RankPointType.NODE_START)
      .sort((p, q) =>
        leftToRight
          ? q.precursors.length - p.precursors.length
          : q.successors.length - p.successors.length)
      .forEach(rp => {
        // put it into the new col
        let place = 0, minCross = Infinity
        for (let curIdx = 0; curIdx <= newCol1.length; curIdx++) {
          // compute edge pairs
          const col1AfterAdd = [...newCol1].splice(curIdx, 0, rp)
          const pairMatrix = this.computePairMatrix(col0, col1AfterAdd, leftToRight)
          // count crossing
          let cross = 0
          pairMatrix.forEach((pairList, otherIdx) => {
            if (otherIdx === curIdx) return   // not add cross of self
            cross += this.computeCrossing(pairMatrix[curIdx], pairList)
          })
          // save result
          if (minCross > cross) {
            place = curIdx
            minCross = cross
          }
        }
        newCol1.splice(place, 0, rp)
      })
    return newCol1;
  }

  /**
   * @param {[RankPoint]} col0
   * @param {[RankPoint]} col1
   * @param {boolean} leftToRight
   * @returns {number[][][]} col1 rp order -> rp.pre/suc order -> pair
   */
  computePairMatrix(col0, col1, leftToRight) {
    const matrix = []
    col1.forEach((rp1, endIdx) => {
      const rp0List = leftToRight ? rp1.precursors : rp1.successors
      const pairList = []
      rp0List.forEach(rp0 => {
        const startIdx = col0.indexOf(rp0)
        pairList.push([startIdx, endIdx])
      })
      matrix.push(pairList)
    })
    return matrix
  }

  computeCrossing(pairList1, pairList2) {
    let cross = 0
    pairList1.forEach(p1 => {
      pairList2.forEach(p2 => {
        cross += this.isCrossing(p1[0], p1[1], p2[0], p2[1]) ? 1 : 0
      })
    })
    return cross
  }

  isCrossing(startIdx0, endIdx0, startIdx1, endIdx1) {
    if (endIdx0 >= endIdx1) {
      endIdx0 += 1
    }
    if (startIdx0 < startIdx1) {
      return endIdx0 > endIdx1
    } else if (startIdx0 > startIdx1) {
      return endIdx0 < endIdx1
    } else {
      return true
    }
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
  }
}
