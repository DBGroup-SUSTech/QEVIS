import { VertexLayoutData } from "../../entities/VertexLayoutData"
import {computeUUID} from "@/utils/utils/uuid";
import {findMinElement} from "@/utils/utils/array/arrayUtils";

export class MSTAggrAlgo {

  /** @type {Graph<VertexLayoutData, number>} */
  graph

  /**
   * @type {function(Graph<VertexLayoutData, *>): void}
   * This func will fill the field y in the data
   */
  reLayoutFunc

  /**
   * @param {Graph<VertexLayoutData, number>} graph
   * @param {function(Graph<VertexLayoutData, number>): void} reLayoutFunc
   */
  constructor(graph, reLayoutFunc) {
    this.graph = graph
    this.reLayoutFunc = reLayoutFunc
  }

  /**
   * @param {number} k
   */
  solve(k) {
    this.computeAllEdgeWeight()
    this.runMSTWithK(k)
  }

  computeAllEdgeWeight() {
    this.graph.edges.forEach(edge => {
      edge.data = this.getWeight(edge)
    })
  }

  /**
   * @param {number} k
   */
  runMSTWithK(k) {
    let nodeCnt = this.graph.nodes.length
    while (nodeCnt > k) {
      let curEdge = findMinElement(this.graph.edges, (e1, e2) => e1.data < e2.data)

      // get new node data
      let src = curEdge.src, dst = curEdge.dst
      let vld = new VertexLayoutData(
        Math.min(src.data.x0, dst.data.x0), Math.max(src.data.x1, dst.data.x1), 0,
        'Group',
        src.data.vertexIdList.concat(dst.data.vertexIdList))
      console.log('merge (%s) (%s) edgeWeight=%s', curEdge.src.id, curEdge.dst.id, curEdge.data.toFixed(0))
      if (curEdge.data === null) {
        console.error("Merge failed !!")
      }

      // modify graph
      let newNode = this.graph.addNode(computeUUID(), vld)
      let precursors = src.inEdges.concat(dst.inEdges)
        .filter(e => e.src !== src)
        .map(e => e.src)
      let successors = src.outEdges.concat(dst.outEdges)
        .filter(e => e.dst !== dst)
        .map(e => e.dst)
      precursors = Array.from(new Set(precursors))
      successors = Array.from(new Set(successors))

      precursors.forEach(p => {
          // console.log('add 1', p.id)
          this.graph.addEdge(p.id, newNode.id)
        })
      successors.forEach(s => {
          // console.log('add 2', s.id)
          this.graph.addEdge(newNode.id, s.id)
        })
      this.graph.removeNode(src)
      this.graph.removeNode(dst)

      this.reLayoutFunc(this.graph)

      // refresh pq
      newNode.inEdges.concat(newNode.outEdges).forEach(e => {
        e.data = this.getWeight(e)
      })

      nodeCnt --
    }
  }

  /**
   * Get the weight of an edge
   * @param {Edge<VertexLayoutData, number>} edge
   * @returns {number}
   */
  getWeight(edge) {
    let d0 = edge.src.data, d1 = edge.dst.data
    let nodeCost = (d0.x1 - d0.x0 + d1.x1 - d1.x0) / 2,
      edgeCostX = Math.max(0, d1.x0 - d0.x1),
      edgeCostY = Math.abs(d1.y - d0.y)
    // console.log('>>>', edge.id, src.type, dst.type)
    return hopCost
      + nodeCostRatio * nodeCost
      + edgeCostXRatio * edgeCostX
      + edgeCostYRatio * edgeCostY
      + (edge.src.outEdges.length <= 1 ? 0 : multiOutCost)
      + (edge.dst.inEdges.length <= 1 ? 0 : multiInCost)
      + (d0.type === 'Group' || d1.type === 'Group' || d0.type === d1.type ? 0 : diffTypeCost)
  }

}

// Algorithm parameters
const hopCost = 0
const nodeCostRatio = 1
const edgeCostXRatio = 10
const edgeCostYRatio = 0.8
const multiOutCost = 1000
const multiInCost = 4000
const diffTypeCost = 2000


