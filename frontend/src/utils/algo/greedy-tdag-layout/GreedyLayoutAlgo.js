/* eslint-disable */

import { VertexLayoutData } from "../../entities/VertexLayoutData"
import { Graph } from "../../utils/graph"

export class GreedyLayoutAlgo {
  rootId
  /** @type {Graph<VertexLayoutData, *>} */
  graph
  gapPixel

  /** @type {Map<(string|number), number>} */
  orderMap

  // nodeMap
  // orderMap
  // childrenMap

  // temp & result
  nodeLaneMap
  ctrlMap

  laneEnds
  laneNodesList
  visited
  laneOccupyArr

  /**
   * @param {(string|number)} rootId
   * @param {Graph<VertexLayoutData, *>} graph
   * @param {number} gapPixel
   * @param {Map<(string|number), number>} [orderMap=null]
   */
  constructor(rootId, graph, gapPixel, orderMap) {
    this.rootId = rootId
    this.graph = graph
    this.gapPixel = gapPixel
    if (!orderMap) {
      orderMap = new Map();
      const orderedNodes = this.computeOrderedNodes(graph);
      orderedNodes.forEach((n, i) => {
        orderMap.set(n.data.vertexIdList[0], i);
      });
    }
    this.orderMap = orderMap;
  }

  /**
   * @param {Graph<VertexLayoutData, *>} graph
   * @returns {Node<VertexLayoutData, *>[]}
   */
  computeOrderedNodes(graph) {
    const {nodes} = graph;

    let orderedNodes = [];
    let visited = new Set();
    let procNode = function (node) {
      if (visited.has(node.id)) {
        return;
      }
      node.outEdges.forEach(edge => {
        procNode(edge.dst);
      })
      orderedNodes.push(node);
      visited.add(node.id);
    }
    let root = nodes[0]
    while (root.outEdges.length !== 0) {
      root = root.outEdges[0].dst;
    }
    procNode(root);
    return orderedNodes;
  }

  solve() {
    this.nodeLaneMap = {}
    this.ctrlMap = {}        // src_dst -> ctrl value
    // let gapPixel = xScale.invert(state.gaspPixel) - xScale.invert(0)

    this.laneEnds = []
    this.laneNodesList = []
    this.visited = new Set()

    // console.log('layout: layout start >>>>>>>>>')
    // console.log('layout: size of vertexes %d', state.vertexes.length)
    this.layoutNodeRecurse(this.rootId)
    // console.log('layout: this.ctrlMap %o', this.ctrlMap)
    // console.log('layout: layout end <<<<<<<<<<')

    /* fix up algo */

    this.laneOccupyArr = []  // row -> occupy -> node, start, end
    this.laneEnds.forEach(() => this.laneOccupyArr.push([]))
    this.visited.clear()

    // this.compressLayout()
    // this.compressLayoutRecursive(this.dagRoot)

    // now laneEnds and laneNodesList are useless

    /* fix up end */

    /* edge layout start */

    // this.layoutEdge()

    /* edge layout end */

  }

  // return: [flag, lane], flag: 0 - normal, 1 - broadcast, 2 - not to render
  layoutNodeRecurse(vertexName) {
    if (this.visited.has(vertexName)) {
      // not care about this for now
      return [1, this.nodeLaneMap[vertexName]]
    }
    let curVertex = this.graph.nodeMap.get(vertexName)     // undefined if not to render
    let laneToTry = 0, targetLane = -1
    let children = !curVertex ? [] : curVertex.inEdges.map(e => e.src)
      .sort((n1, n2) => this.orderMap.get(n1.data.vertexIdList[0]) - this.orderMap.get(n2.data.vertexIdList[0]))
    let childLaneInfos = []
    for (let childIdx = 0; childIdx < children.length; childIdx++) {
      let child = children[childIdx].id
      // console.log('layout: layout child %s', child)
      let childLaneInfo = this.layoutNodeRecurse(child)
      childLaneInfos.push(childLaneInfo)
      // now the boundary is updated, try to layout current node, if we render it
      if (childIdx === 0) {
        // laneToTry = Math.max(0, childLaneInfo[1] - 1)
        laneToTry = Math.max(0, childLaneInfo[1])
      }
      if (curVertex == undefined || !curVertex.data.toRender) {
        continue    // curVertex doesn't need to assigned
      }
      if (targetLane !== -1) {
        continue    // curVertex assigned
      }
      let hit = false
      for (let laneCnt = this.laneEnds.length; laneToTry < laneCnt; laneToTry++) {
        if (this.laneEnds[laneToTry] < curVertex.data.x0) {
          // check child's ctrl
          let childConflict = false
          for (let i = childIdx; i >= 0; i--) {
            let flag = childLaneInfos[i][0]
            if (flag !== 2) {
              let childX1 = this.graph.nodeMap.get(children[i].id).data.x1
              if (childX1 + this.gapPixel < this.laneEnds[laneToTry]) {
                childConflict = true
                break
              }
            }
          }
          if (!childConflict) {
            // console.log('layout: %s hit (upper). %d %o', vertexName, laneToTry, children)
            hit = true        // can arrange to this lane
            break
          }
        }
      }
      if (hit) {
        targetLane = laneToTry          // this lane is ok for curVertex
        this.nodeLaneMap[vertexName] = targetLane
        this.laneEnds[targetLane] = curVertex.data.x1 + this.gapPixel
        this.laneNodesList[targetLane].push(curVertex.id)
      }
    }
    // finished arrange all children
    if (curVertex != undefined && targetLane === -1) {
      let hit = false
      for (let laneCnt = this.laneEnds.length; laneToTry < laneCnt; laneToTry++) {
        if (this.laneEnds[laneToTry] < curVertex.data.x0) {
          // check child's ctrl
          let childConflict = false
          for (let i = children.length - 1; i >= 0; i--) {
            let flag = childLaneInfos[i][0]
            if (flag !== 2) {
              let childX1 = this.graph.nodeMap.get(children[i].id).data.x1
              if (childX1 + this.gapPixel < this.laneEnds[laneToTry]) {
                childConflict = true
                break
              }
            }
          }
          if (!childConflict) {
            // console.log('layout: %s hit (lower). %d', vertexName, laneToTry)
            hit = true        // can arrange to this lane
            break
          }
        }
      }
      if (hit) {
        targetLane = laneToTry
      } else {    // curVertex need arrange to new line
        // console.log('layout: %s new line. %d', vertexName, laneToTry)
        targetLane = this.laneEnds.length
        this.laneEnds.push(0)
        this.laneNodesList.push([])
      }
      this.nodeLaneMap[vertexName] = targetLane
      this.laneEnds[targetLane] = curVertex.data.x1 + this.gapPixel
      this.laneNodesList[targetLane].push(curVertex.id)
    }

    if (curVertex != undefined) {
      // fix all edge come from children [0,i]
      let upperChildEndIdx = -1,
        parallelChildIdx = null,       // only one if have
        lowerChildStartIdx = children.length
      for (let i = 0; i < children.length; i++) {
        let [flag, arrangedChildLane] = childLaneInfos[i]
        if (flag === 2) {
          continue
        }
        if (arrangedChildLane < targetLane) {
          upperChildEndIdx = i
        }
        if (arrangedChildLane === targetLane) {
          parallelChildIdx = i
        }
        if (arrangedChildLane > targetLane) {
          lowerChildStartIdx = i
          break
        }
      }
      // console.log("layout: %s id div, %d, %d, %d", vertexName, upperChildEndIdx, parallelChildIdx, lowerChildStartIdx)
      let originBoundary = 0;
      if (parallelChildIdx != null) {
        let childId = children[parallelChildIdx].id
        let childVertex = this.graph.nodeMap.get(childId)
        // let edgeId = this.orderMap[childId] + '_' + curVertexId
        originBoundary = childVertex.data.x1 + this.gapPixel
        // this.ctrlMap[edgeId] = originBoundary
      }
      let boundary = originBoundary
      for (let i = upperChildEndIdx; i >= 0; i--) {
        let childId = children[i].id
        let childVertex = this.graph.nodeMap.get(childId)
        let endPlusGasp = childVertex.data.x1 + this.gapPixel
        // let edgeId = this.orderMap[childId] + '_' + curVertexId
        let [flag, childLane] = childLaneInfos[i]

        if (flag !== 2) {
          if (boundary <= endPlusGasp) {       // #2.1
            boundary = endPlusGasp
            // this.ctrlMap[edgeId] = endPlusGasp
            // console.log('layout: #2.1 1 from %s to %s', childName, vertexName)
          } else {        // #2.2
            // this.ctrlMap[edgeId] = boundary
            // console.log('layout: #2.2 1 from %s to %s', childName, vertexName)
          }
          this.laneEnds[childLane] = Math.max(this.laneEnds[childLane], boundary)
        }
      }
      boundary = originBoundary
      for (let i = lowerChildStartIdx; i < children.length; i++) {
        let childName = children[i].id
        let childVertex = this.graph.nodeMap.get(childName)
        let endPlusGasp = childVertex.data.x1 + this.gapPixel
        // let edgeId = this.orderMap[childName] + '_' + curVertexId
        let [flag, childLane] = childLaneInfos[i]

        if (flag !== 2) {
          if (boundary <= endPlusGasp) {       // #2.1
            boundary = endPlusGasp
            // this.ctrlMap[edgeId] = endPlusGasp
            // console.log('layout: #2.1 2 from %s to %s', childName, vertexName)
          } else {        // #2.2
            // this.ctrlMap[edgeId] = boundary
            // console.log('layout: #2.2 2 from %s to %s', childName, vertexName)
          }
          this.laneEnds[childLane] = Math.max(this.laneEnds[childLane], boundary)
        }
      }
    }

    this.visited.add(vertexName)
    if (curVertex == undefined || !curVertex.toRender) {
      return [2, -1]
    }
    return [0, targetLane]
  }

  // null for not find, or [laneIdx, occupyIdx]
  findValidSpace(curVertex)  {
    let result = null;
    for (let laneIdx = this.nodeLaneMap[curVertex.id] - 1; laneIdx >= 0; --laneIdx) {
      let occupyIdx = 0, laneOccupy = this.laneOccupyArr[laneIdx]
      for (let occupy of laneOccupy) {
        if (occupy.x1 + this.gapPixel < curVertex.data.x0) ++occupyIdx
        else break
      }
      let valid = occupyIdx >= laneOccupy.length
      valid ||= curVertex.data.x1 + this.gapPixel < laneOccupy[occupyIdx].x0
      if (valid) {
        result = [laneIdx, occupyIdx]
      } else {
        break
      }
    }
    return result
  }

  compressLayout() {
    let laneCnt = Object.keys(this.laneEnds).length
    for (let laneIdx = 0; laneIdx < laneCnt; ++laneIdx) {
      let laneVertexes = this.laneNodesList[laneIdx]
      let tryingMove = true
      for (let vtxName of laneVertexes) {
        let curVertex = this.graph.nodeMap.get(vtxName)
        if (tryingMove) {
          let validMoveSpace = this.findValidSpace(curVertex)
          if (validMoveSpace !== null) {
            this.laneOccupyArr[validMoveSpace[0]].splice(validMoveSpace[1], 0, curVertex)
            this.nodeLaneMap[curVertex.id] = validMoveSpace[0]
          } else {
            tryingMove = false    // can't move any more
          }
        }
        if (!tryingMove) {
          this.laneOccupyArr[this.nodeLaneMap[curVertex.id]].push(curVertex)
        }
      }
    }
  }

  setResultToGraph(laneHeight) {
    Object.keys(this.nodeLaneMap).forEach(vtxName => {
      let laneIdx = this.nodeLaneMap[vtxName]
      this.graph.nodeMap.get(vtxName).data.y = laneIdx * laneHeight
    })
  }

  // return: 0 visited, 1 not move, 2 moved
  // compressLayoutRecursive(vertexName) {
  //   console.log(vertexName, ' start')
  //   if (this.visited.has(vertexName)) {
  //     return 0
  //   }
  //   let curVertex = this.nodeMap[vertexName]     // undefined if not to render
  //   // let curVertexId = state.orderMap[vertexName]
  //   let children = this.childrenMap[vertexName]
  //   let moveSpace = null, triedMove = false;
  //   for (let childIdx = 0; childIdx < children.length; childIdx++) {
  //     let child = children[childIdx];
  //     let ret = this.compressLayoutRecursive(child);
  //     if (ret === 1) {
  //       triedMove = true
  //     }
  //     if (!triedMove && childIdx === 0 && curVertex != null) {
  //       // try to move current node
  //       moveSpace = this.findValidSpace(curVertex)
  //       triedMove = true
  //     }
  //   }
  //   if (!triedMove && curVertex != null) {
  //     // try to move current node
  //     moveSpace = this.findValidSpace(curVertex)
  //   }
  //
  //   if (curVertex != null) {
  //     if (moveSpace != null) {
  //       this.laneOccupyArr[moveSpace[0]].splice(moveSpace[1], 0, curVertex)
  //       this.nodeLaneMap[vertexName] = moveSpace[0]
  //     } else {
  //       this.laneOccupyArr[this.nodeLaneMap[vertexName]].push(curVertex)
  //     }
  //   }
  //   this.visited.add(vertexName)
  //   console.log(vertexName, moveSpace)
  //   return moveSpace == null ? 1 : 2;
  // }

}
