import { VertexLayoutData } from "../../entities/VertexLayoutData"
import {computeUUID} from "@/utils/utils/uuid";
import {UnionFind} from "@/utils/utils/UnionFind";

export class MCAggrAlgo {

  /** @type {Graph<VertexLayoutData, number>} */
  graph

  /**
   * @type {function(Graph<VertexLayoutData, *>): void}
   * This func will fill the field y in the data
   */
  reLayoutFunc

  /** @type {number} */
  chainRate
  /** @type {number} */
  mergeRate

  /**
   * @param {Graph<VertexLayoutData, number>} graph
   * @param {function(Graph<VertexLayoutData, number>): void} reLayoutFunc
   * @param {number} chainRate
   * @param {number} mergeRate
   */
  constructor(graph, reLayoutFunc, chainRate, mergeRate) {
    this.graph = graph
    this.reLayoutFunc = reLayoutFunc
    this.chainRate = chainRate
    this.mergeRate = mergeRate
  }

  solve(limit) {
    this.computeAllEdgeWeight()
    this.runMC(limit)
  }

  computeAllEdgeWeight() {
    this.graph.edges.forEach(edge => {
      edge.data = this.getWeight(edge)
    })
  }

  runMC(limit) {
    while (limit > 0 && this.graph.nodes.length > 1) {
      const {clusters: chainClusters, weights: chainWeights} = this.getChainClusters()
      const {clusters: mergeClusters, weights: mergeWeights} = this.getMergeClusters()

      if (mergeClusters.length !== 0 && chainClusters.length !== 0) {
        const chainWeightSum = chainWeights.reduce((a, b) => a + b) / chainWeights.length
        const mergeWeightSum = mergeWeights.reduce((a, b) => a + b) / mergeWeights.length
        if (chainWeightSum < mergeWeightSum) {
          chainClusters.forEach(c => this.mergeCluster(c, 'chain'))
        } else {
          mergeClusters.forEach(c => this.mergeCluster(c, 'merge'))
        }
      } else if (mergeClusters.length === 0) {
        chainClusters.forEach(c => this.mergeCluster(c, 'chain'))
      } else {
        mergeClusters.forEach(c => this.mergeCluster(c, 'merge'))
      }

      limit -= 1;

      this.reLayoutFunc(this.graph)
    }
  }

  getChainClusters() {
    const chainPatterns = this.graph.edges.filter(e => {
      return e.src.outEdges.length === 1
        && e.dst.inEdges.length === 1
    })
    if (chainPatterns.length === 0) {
      return {clusters: [], weights: []}
    }
    const uf = new UnionFind()
    const srcMap = new Map()    // src -> edge
    chainPatterns.forEach(chain => {
      uf.add(chain)
      srcMap.set(chain.src, chain)
    })
    chainPatterns.forEach(chain => {
      if (srcMap.has(chain.dst)) {
        const nextChain = srcMap.get(chain.dst)
        uf.union(chain, nextChain)
      }
    })
    const edgeClusters = uf.getAllUnions()
    const weights = []
    edgeClusters.forEach(c => weights.push(c.reduce((sum, e) => sum + e.data, 0)) / c.length)
    const threshold = Math.min(...weights) * this.chainRate
    const retClusters = [], retWeight = []
    edgeClusters.forEach((c, i) => {
      if (weights[i] <= threshold) {
        retClusters.push(c)
        retWeight.push(weights[i])
      }
    })

    return {clusters: retClusters, weights: retWeight}
  }

  getMergeClusters() {
    const mergePatterns = this.graph.edges.filter(e => {
      return e.src.outEdges.length === 1 && e.dst.inEdges.length > 1
    })
    if (mergePatterns.length === 0) {
      return {clusters: [], weights: []}
    }
    const uf = new UnionFind()
    const dstMap = new Map()    // dst -> edge
    mergePatterns.forEach(merge => {
      uf.add(merge)
      dstMap.set(merge.dst, merge)
    })
    mergePatterns.forEach(merge => {
      if (dstMap.has(merge.dst)) {
        const nextChain = dstMap.get(merge.dst)
        uf.union(merge, nextChain)
      }
    })
    const edgeClusters = uf.getAllUnions()
    const weights = []
    edgeClusters.forEach(c => weights.push(c.reduce((sum, e) => sum + e.data, 0)) / c.length)
    const threshold = Math.min(...weights) * this.mergeRate
    const retClusters = [], retWeight = []
    edgeClusters.forEach((c, i) => {
      if (weights[i] <= threshold) {
        retClusters.push(c)
        retWeight.push(weights[i])
      }
    })

    return {clusters: retClusters, weights: retWeight}
  }

  /**
   * @param {Edge<VertexLayoutData, number>[]} edges
   * @param type
   */
  mergeCluster(edges, type) {
    const nodes = [], nodeSet = new Set()
    edges.forEach(e => {
      [e.src, e.dst].forEach(n => {
        if (nodeSet.has(n)) {
          return
        }
        nodeSet.add(n)
        nodes.push(n)
      })
    })
    console.log(edges, nodes)

    // get new node data
    let vld = new VertexLayoutData(
      Math.min(...nodes.map(n => n.data.x0)),
      Math.max(...nodes.map(n => n.data.x1)),
      0,
      nodes.map(n => n.data.type).join(type === 'chain' ? '-' : '}'),
      nodes.reduce((list, node) => list.concat(node.data.vertexIdList), [])
    )

    // modify graph

    let newNode = this.graph.addNode(computeUUID(), vld)

    const inEdges = nodes.reduce((list, node) => list.concat(node.inEdges), [])
      .filter(e => !nodeSet.has(e.src))
    const outEdges = nodes.reduce((list, node) => list.concat(node.outEdges), [])
      .filter(e => !nodeSet.has(e.dst))
    let precursors = inEdges.map(e => e.src)
    let successors = outEdges.map(e => e.dst)
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
    nodes.forEach(n => this.graph.removeNode(n))

    // refresh data
    newNode.inEdges.concat(newNode.outEdges).forEach(e => {
      e.data = this.getWeight(e)
    })
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
const edgeCostXRatio = 4
const edgeCostYRatio = 0.1
const multiOutCost = 0
const multiInCost = 0
const diffTypeCost = 0


