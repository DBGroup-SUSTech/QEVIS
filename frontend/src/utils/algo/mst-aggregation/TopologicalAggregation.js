import { VertexLayoutData } from "../../entities/VertexLayoutData"
import {computeUUID} from "@/utils/utils/uuid";
import {UnionFind} from "@/utils/utils/UnionFind";

export class TopologicalAggrAlgo {

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
    // init in degree map
    const inDegreeCountMap = new Map()
    this.graph.nodes.forEach(node => {
      inDegreeCountMap.set(node.id, 0)
    })
    this.graph.nodes.forEach(node => {
      node.outEdges.forEach(e => {
        const degree = inDegreeCountMap.get(e.dst.id)
        inDegreeCountMap.set(e.dst.id, degree + 1)
      })
    })

    // get clusters (node clusters)
    const layerClusters = []
    let counter = this.graph.nodes.length
    while(counter > 0) {
      const layerNodes = this.graph.nodes.filter(n => inDegreeCountMap.get(n.id) === 0)
      layerNodes.forEach(n => {
        inDegreeCountMap.delete(n.id)
        n.outEdges.forEach(e => {
          const degree = inDegreeCountMap.get(e.dst.id)
          inDegreeCountMap.set(e.dst.id, degree - 1)
        })
      })
      layerClusters.push(layerNodes)
      counter -= layerNodes.length
    }

    // merge clusters
    layerClusters.forEach(c => this.mergeClusterByNodes(c, 'not chain'))
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

