/* eslint-disable */

class Block {
  startTime
  endTime
  constructor(startTime, endTime) {
    this.startTime = startTime
    this.endTime = endTime
  }
}

class VtxBlock extends Block {
  next = null
  vertex
  constructor(vertex) {
    super(vertex.startTime, vertex.endTime)
    this.vertex = vertex
  }
}

class EdgeBlock extends Block{
  next = null
  outs = [[], []]   // top, bottom
}

class GapBlock extends Block {
  next = null
  outs = [null, null]   // top, bottom
}

export class LayoutAlgo {
  startTime
  endTime
  dagRoot
  vertexMap
  orderMap
  childrenMap
  gaspTime

  // temp & result
  vtxLaneMap
  ctrlMap

  laneEnds
  laneVertexesList
  visited
  laneOccupyArr

  constructor(state, gaspTime) {
    this.startTime = state.startTime
    this.endTime = state.endTime
    this.dagRoot = state.dagRoot
    this.vertexMap = state.vertexMap
    this.orderMap = state.orderMap
    this.childrenMap = state.childrenMap
    this.gaspTime = gaspTime
  }

  solve() {
    this.vtxLaneMap = {}
    this.ctrlMap = {}        // src_dst -> ctrl value
    // let gaspTime = xScale.invert(state.gaspPixel) - xScale.invert(0)

    this.laneEnds = []
    this.laneVertexesList = []
    this.visited = new Set()

    // console.log('layout: layout start >>>>>>>>>')
    // console.log('layout: size of vertexes %d', state.vertexes.length)
    this.layoutVertexRecurse(this.dagRoot)
    // console.log('layout: this.ctrlMap %o', this.ctrlMap)
    // console.log('layout: layout end <<<<<<<<<<')

    /* fix up algo */

    this.laneOccupyArr = []  // row -> occupy -> vertex, start, end
    this.laneEnds.forEach(() => this.laneOccupyArr.push([]))
    this.visited.clear()

    // this.compressLayout()
    // this.compressLayoutRecursive(this.dagRoot)

    // now laneEnds and laneVertexesList are useless

    /* fix up end */

    /* edge layout start */

    // this.layoutEdge()

    /* edge layout end */

  }

  // return: [flag, lane], flag: 0 - normal, 1 - broadcast, 2 - not to render
  layoutVertexRecurse(vertexName) {
    if (this.visited.has(vertexName)) {
      // not care about this for now
      return [1, this.vtxLaneMap[vertexName]]
    }
    let curVertex = this.vertexMap[vertexName]     // undefined if not to render
    let curVertexId = this.orderMap[vertexName]
    let laneToTry = 0, targetLane = -1
    let children = this.childrenMap[vertexName]
    let childLaneInfos = []
    for (let childIdx = 0; childIdx < children.length; childIdx++) {
      let child = children[childIdx]
      // console.log('layout: layout child %s', child)
      let childLaneInfo = this.layoutVertexRecurse(child)
      childLaneInfos.push(childLaneInfo)
      // now the boundary is updated, try to layout current node, if we render it
      if (childIdx === 0) {
        // laneToTry = Math.max(0, childLaneInfo[1] - 1)
        laneToTry = Math.max(0, childLaneInfo[1])
      }
      if (curVertex == undefined) {
        continue    // curVertex doesn't need to assigned
      }
      if (targetLane !== -1) {
        continue    // curVertex assigned
      }
      let hit = false
      for (let laneCnt = this.laneEnds.length; laneToTry < laneCnt; laneToTry++) {
        if (this.laneEnds[laneToTry] < curVertex.startTime) {
          // check child's ctrl
          let childConflict = false
          for (let i = childIdx; i >= 0; i--) {
            let flag = childLaneInfos[i][0]
            if (flag !== 2) {
              let childEndTime = this.vertexMap[children[i]].endTime
              if (childEndTime + this.gaspTime < this.laneEnds[laneToTry]) {
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
        this.vtxLaneMap[vertexName] = targetLane
        this.laneEnds[targetLane] = curVertex.endTime + this.gaspTime
        this.laneVertexesList[targetLane].push(curVertex.vertexName)
      }
    }
    // finished arrange all children
    if (curVertex != undefined && targetLane === -1) {
      let hit = false
      for (let laneCnt = this.laneEnds.length; laneToTry < laneCnt; laneToTry++) {
        if (this.laneEnds[laneToTry] < curVertex.startTime) {
          // check child's ctrl
          let childConflict = false
          for (let i = children.length - 1; i >= 0; i--) {
            let flag = childLaneInfos[i][0]
            if (flag !== 2) {
              let childEndTime = this.vertexMap[children[i]].endTime
              if (childEndTime + this.gaspTime < this.laneEnds[laneToTry]) {
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
        this.laneVertexesList.push([])
      }
      this.vtxLaneMap[vertexName] = targetLane
      this.laneEnds[targetLane] = curVertex.endTime + this.gaspTime
      this.laneVertexesList[targetLane].push(curVertex.vertexName)
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
        let childName = children[parallelChildIdx]
        let childVertex = this.vertexMap[childName]
        let edgeId = this.orderMap[childName] + '_' + curVertexId
        originBoundary = childVertex.endTime + this.gaspTime
        this.ctrlMap[edgeId] = originBoundary
      }
      let boundary = originBoundary
      for (let i = upperChildEndIdx; i >= 0; i--) {
        let childName = children[i]
        let childVertex = this.vertexMap[childName]
        let endPlusGasp = childVertex.endTime + this.gaspTime
        let edgeId = this.orderMap[childName] + '_' + curVertexId
        let [flag, childLane] = childLaneInfos[i]

        if (flag !== 2) {
          if (boundary <= endPlusGasp) {       // #2.1
            boundary = endPlusGasp
            this.ctrlMap[edgeId] = endPlusGasp
            // console.log('layout: #2.1 1 from %s to %s', childName, vertexName)
          } else {        // #2.2
            this.ctrlMap[edgeId] = boundary
            // console.log('layout: #2.2 1 from %s to %s', childName, vertexName)
          }
          this.laneEnds[childLane] = Math.max(this.laneEnds[childLane], boundary)
        }
      }
      boundary = originBoundary
      for (let i = lowerChildStartIdx; i < children.length; i++) {
        let childName = children[i]
        let childVertex = this.vertexMap[childName]
        let endPlusGasp = childVertex.endTime + this.gaspTime
        let edgeId = this.orderMap[childName] + '_' + curVertexId
        let [flag, childLane] = childLaneInfos[i]

        if (flag !== 2) {
          if (boundary <= endPlusGasp) {       // #2.1
            boundary = endPlusGasp
            this.ctrlMap[edgeId] = endPlusGasp
            // console.log('layout: #2.1 2 from %s to %s', childName, vertexName)
          } else {        // #2.2
            this.ctrlMap[edgeId] = boundary
            // console.log('layout: #2.2 2 from %s to %s', childName, vertexName)
          }
          this.laneEnds[childLane] = Math.max(this.laneEnds[childLane], boundary)
        }
      }
    }

    this.visited.add(vertexName)
    if (curVertex == undefined) {
      return [2, -1]
    }
    return [0, targetLane]
  }

  // null for not find, or [laneIdx, occupyIdx]
  findValidSpace(curVertex)  {
    let result = null;
    for (let laneIdx = this.vtxLaneMap[curVertex.vertexName] - 1; laneIdx >= 0; --laneIdx) {
      let occupyIdx = 0, laneOccupy = this.laneOccupyArr[laneIdx]
      for (let occupy of laneOccupy) {
        if (occupy.endTime + this.gaspTime < curVertex.startTime) ++occupyIdx
        else break
      }
      let valid = occupyIdx >= laneOccupy.length
      valid ||= curVertex.endTime + this.gaspTime < laneOccupy[occupyIdx].startTime
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
      let laneVertexes = this.laneVertexesList[laneIdx]
      let tryingMove = true
      for (let vtxName of laneVertexes) {
        let curVertex = this.vertexMap[vtxName]
        if (tryingMove) {
          let validMoveSpace = this.findValidSpace(curVertex)
          if (validMoveSpace !== null) {
            this.laneOccupyArr[validMoveSpace[0]].splice(validMoveSpace[1], 0, curVertex)
            this.vtxLaneMap[curVertex.vertexName] = validMoveSpace[0]
          } else {
            tryingMove = false    // can't move any more
          }
        }
        if (!tryingMove) {
          this.laneOccupyArr[this.vtxLaneMap[curVertex.vertexName]].push(curVertex)
        }
      }
    }
  }

  // return: 0 visited, 1 not move, 2 moved
  // compressLayoutRecursive(vertexName) {
  //   console.log(vertexName, ' start')
  //   if (this.visited.has(vertexName)) {
  //     return 0
  //   }
  //   let curVertex = this.vertexNameMap[vertexName]     // undefined if not to render
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
  //       this.vtxLaneMap[vertexName] = moveSpace[0]
  //     } else {
  //       this.laneOccupyArr[this.vtxLaneMap[vertexName]].push(curVertex)
  //     }
  //   }
  //   this.visited.add(vertexName)
  //   console.log(vertexName, moveSpace)
  //   return moveSpace == null ? 1 : 2;
  // }

  layoutEdge() {
    let gapBlocksList = []
    let blocksList = []
    let laneCnt = 0

    // compute laneCnt
    for (let laneOccupy of this.laneOccupyArr) {
      if (laneOccupy.length !== 0) {
        ++ laneCnt
      } else {
        break
      }
    }
    console.log('new lane cnt ', laneCnt)

    // init blocks list
    gapBlocksList.push([])
    for (let i = 0; i < laneCnt; i++) {
      gapBlocksList.push([])
      blocksList.push([])
    }

    for (let laneIdx = 0; laneIdx < laneCnt; ++laneIdx) {
      let timePtr = this.startTime
      let blocks = blocksList[laneIdx]
      for (let curVertex of this.laneOccupyArr[laneIdx]) {
        // add a EB
        blocks.push(new EdgeBlock(timePtr, curVertex.startTime))
        // add a VB
        blocks.push(new VtxBlock(curVertex))
        timePtr = curVertex.endTime
      }
      // add a extra EB
      blocks.push(new EdgeBlock(timePtr, this.endTime))
      // link them
      for (let i = 0, iLen = blocks.length; i < iLen - 1; i++) {
        blocks[i].next = blocks[i+1]
      }
    }
    console.log('blocksList', blocksList)

    let gapBlocks

    gapBlocks = gapBlocksList[0]
    for (let block of blocksList[0]) {
      let gBlock = new GapBlock(block.startTime, block.endTime)
      gapBlocks.push(gBlock)
      gBlock.outs[1] = block
    }

    for (let i = 0; i < laneCnt - 1; i++) {
      // process gapBlocks between i and i+1. its idx is i + 1
      gapBlocks = gapBlocksList[i+1]
      let topPtr = 0, btmPtr = 0
      let topArr = blocksList[i], btmArr = blocksList[i+1]
      let gBlocksCnt = topArr.length + btmArr.length - 1
      let timePtr = this.startTime
      for (let j = 0; j < gBlocksCnt; j++) {
        let newGBlock = new GapBlock(timePtr, null)
        let top = topArr[topPtr], btm = btmArr[btmPtr]
        newGBlock.outs[0] = top
        newGBlock.outs[1] = btm
        if (top.endTime <= btm.endTime) {
          // choose top
          timePtr = top.endTime
          ++topPtr
        } else {
          // choose btm
          timePtr = btm.endTime
          ++btmPtr
        }
        newGBlock.endTime = timePtr
        gapBlocks.push(newGBlock)
      }
      // link them
      for (let j = 0; j < gBlocksCnt - 1; j++) {
        gapBlocks[j].next = gapBlocks[j+1]
      }
      // link them with normal blocks
      for (let gBlock of gapBlocks) {
        let upperOne = gBlock.outs[0]
        if (upperOne instanceof EdgeBlock) {
          upperOne.outs[1].push(gBlock)
        }
        let lowerOne = gBlock.outs[1]
        if (lowerOne instanceof EdgeBlock) {
          lowerOne.outs[0].push(gBlock)
        }
      }
    }

    gapBlocks = gapBlocksList[laneCnt]
    for (let block of blocksList[laneCnt-1]) {
      let gBlock = new GapBlock(block.startTime, block.endTime)
      gapBlocks.push(gBlock)
      gBlock.outs[0] = block
    }

    console.log('gapBlocksList', gapBlocksList)

    // init finished

    // for (let laneOccupy of this.laneOccupyArr) {
    //   for (let curVertex of laneOccupy) {
    //
    //   }
    // }
  }

}
