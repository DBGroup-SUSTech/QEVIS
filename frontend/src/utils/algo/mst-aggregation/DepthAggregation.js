import { VertexLayoutData } from "../../entities/VertexLayoutData"
import {computeUUID} from "@/utils/utils/uuid";
import {UnionFind} from "@/utils/utils/UnionFind";

export class DepthAggrAlgo {

  /** @type {Graph<VertexLayoutData, any>} */
  graph

  /**
   * @param {Graph<VertexLayoutData, any>} graph
   */
  constructor(graph) {
    this.graph = graph
  }

  solve() {
    this.mergeChainClusters()
    this.mergeLayerClusters()
  }

  mergeChainClusters() {
    const chainClusters = this.getChainClusters()
    chainClusters.forEach(c => this.mergeClusterByEdges(c))
  }

  getChainClusters() {
    const chainPatterns = this.graph.edges.filter(e => {
      return e.src.outEdges.length === 1
        && e.dst.inEdges.length === 1
    })
    if (chainPatterns.length === 0) {
      return []
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
    return uf.getAllUnions()
  }

  mergeLayerClusters() {
    const maxDepthMap = this.getMaxDepthMap()
    // flat child rank
    this.graph.nodes.forEach(n => {
      const children = n.inEdges.map(e => e.src)
      const childMaxDepth = Math.max(...children.map(child => maxDepthMap.get(child.id)))
      children.forEach(n => maxDepthMap.set(n.id, childMaxDepth))
    })

    // get clusters (node clusters)
    const layerClusters = []
    this.graph.nodes.forEach(node => {
      const maxDepth = maxDepthMap.get(node.id)
      while (layerClusters.length <= maxDepth) {
        layerClusters.push([])
      }
      layerClusters[maxDepth].push(node)
    })

    // merge clusters
    layerClusters.forEach(c => this.mergeClusterByNodes(c, 'not chain'))
  }

  getRoot() {
    let node = this.graph.nodes[0]
    while (node.outEdges.length !== 0) {
      node = node.outEdges[0].dst
    }
    return node
  }

  getMaxDepthMap() {
    const maxDepthMap = new Map()
    this.graph.nodes.forEach(n => maxDepthMap.set(n.id, 0))

    const dfs = function dfs(node, depth) {
      const maxDepth = Math.max(maxDepthMap.get(node.id), depth)
      maxDepthMap.set(node.id, maxDepth)
      node.inEdges.forEach(inEdge => dfs(inEdge.src, maxDepth + 1))
    }

    dfs(this.getRoot(), 0)
    return maxDepthMap
  }

  /**
   * @param {Edge<VertexLayoutData, any>[]} edges
   */
  mergeClusterByEdges(edges) {
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
    console.log('merge', edges, nodes)

    this.mergeClusterByNodes(nodes, 'chain')
  }

  mergeClusterByNodes(nodes, type) {
    const nodeSet = new Set(nodes)

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
  }

}

