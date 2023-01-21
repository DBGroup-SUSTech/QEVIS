/* eslint-disable */

import {computeUUID} from "@/utils/utils/uuid";
import {UnionFind} from "@/utils/utils/UnionFind";
import {AggrTreeNode, TreeNodeType} from "@/utils/algo/tl-aggregation/AggrTreeNode";
import {AggrTree} from "@/utils/algo/tl-aggregation/AggrTree";
import {unique} from "@/utils/utils/array/arrayUtils";
import {Graph} from "@/utils/utils/graph";
import {HierarchyGraph} from "./HierarchyGraph";

export class TLAggrAlgo {
  /** @type {HierarchyGraph} */
  hGraph

  /** @type {AggrTree} */

  /*
            root
          /      \
  internalNode   internalNode
     /            /   \
  leafNode      ...   ...

  internalNode: buttonInternalNode, topInternalNode, other

  */

  // leafNodes
  // /**
  //  * @type {Map<string, AggrTreeNode>}
  //  * Map graph node to its single TreeNode (leaf node)
  //  */
  // gNodeId2TreeNode

  /** @type {Node<Graph<AggrTreeNode,any>, any>[][]} */
  layerClusters

  /**
   * @param {Graph<any, any>} graph
   */
  constructor(graph) {
    this.hGraph = new HierarchyGraph(graph)
  }

  solve() {
    const initMergedNodes = this.mergeChainClusters()

    // divide bLayerNodes into serial layer
    this.computeLayerClusters()

    // create root for each cluster
    const subRoots = []
    this.layerClusters.forEach(cluster => {
      const nodeList = cluster.map(node => node.data.nodeList).flat()
      if (cluster.length === 1) {
        subRoots.push(cluster[0].data)
      } else {
        const newNode = this.hGraph.tree.addNode(TreeNodeType.INTERNAL, nodeList, cluster.map(node => node.data))
        cluster.forEach(child => child.data.parent = newNode)
        subRoots.push(newNode)
      }
    })

    const nodeList = subRoots.reduce((arr, node) => arr.concat(node.nodeList), [])
    const root = this.hGraph.tree.addNode(TreeNodeType.ROOT, nodeList, subRoots)
    this.hGraph.tree.root = root
    subRoots.forEach(subRoot => subRoot.parent = root)

    // console.log('hGraph', this.hGraph)

    const func = function(tNode) {
      return {
        id: tNode.nodeList.map(n => n.data.type).join('-'),
        children: tNode.children.map(n => func(n))
      }
    }
    // console.log('tree', func(this.hGraph.tree.root))

    // this.hGraph.aggregateNodeChildren(subRoots[0])
    // this.hGraph.expandNode(this.hGraph.tree.nodes[25])

    // console.table(temp1.root.children.map(c => c.nodeList.map(n => n.id).join(' ')))
    // .forEach(s => console.log(s))
    // function getName(node) {return node.data.nodeList.map(n => n.id).join(' ')}
    // console.table(temp1.edges.map(e => [getName(e.src), getName(e.dst)]))

    // expand all
    initMergedNodes.forEach(node => this.hGraph.expandNode(node.data))
  }

  /**
   * @returns {Node<AggrTreeNode,any>[]}
   */
  mergeChainClusters() {
    const chainClusters = this.getChainClusters()   // gNode
    const tNodeClusters = chainClusters.map(cluster => {
      return cluster.map(gNode => this.hGraph.originalId2leaf.get(gNode.id))
    })
    const initMergedNodes = []
    tNodeClusters.forEach(cluster => {
      const node = this.hGraph.mergeNodes(cluster)
      initMergedNodes.push(node)
    })
    return initMergedNodes
  }

  /**
   * Get all clusters of adjacent chain gNodes
   * @returns {Node[][]}
   */
  getChainClusters() {
    // get edge clusters
    const chainPatterns = this.hGraph.graph.edges.filter(e => {
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

    // get nodeClusters
    const edgeClusters = uf.getAllUnions()
    const nodeClusters = []
    edgeClusters.forEach(edges => {
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

      nodeClusters.push(nodes)
    })

    return nodeClusters
  }

  computeLayerClusters() {
    const gNodes = this.hGraph.graph.nodes
    // init in degree map
    const inDegreeCountMap = new Map()    // treeNode.id -> inDegree
    gNodes.forEach(node => {
      inDegreeCountMap.set(node.id, 0)
    })
    gNodes.forEach(node => {
      node.outEdges.forEach(e => {
        const degree = inDegreeCountMap.get(e.dst.id)
        inDegreeCountMap.set(e.dst.id, degree + 1)
      })
    })

    // get clusters (node clusters)
    const layerClusters = []
    let counter = gNodes.length
    while(counter > 0) {
      const layerNodes = gNodes.filter(n => inDegreeCountMap.get(n.id) === 0)
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

    this.layerClusters = layerClusters
  }

  computeAllLayerTreeRoots() {
    const layerTreeRoots = []
    this.layerClusters.forEach(layerCluster => {
      const subRoot = this.buildTreeFromBottom(layerCluster)
      layerTreeRoots.push(subRoot)
    })
    return layerTreeRoots
  }

  /**
   * @param {AggrTreeNode[]} layerCluster
   */
  buildTreeFromBottom(layerCluster) {
    if (layerCluster.length === 0) {
      console.error('empty layerCluster')
      return
    }
    let currentNodesV = [...layerCluster]   // vertical
    let currentNodesH = [...layerCluster]   // horizontal
    let h2v = new Map()
    layerCluster.forEach(node => h2v.set(node, node))

    while (currentNodesH.length > 1) {
      // group some nodes
      // parent -> children, horizontal direction
      let parent2Children = new Map()
      currentNodesH.forEach(node => {
        const parents = this.getBLayerSuccessors(node)
        const parent = parents.length === 0 ? node : parents[0]
        if (parent2Children.has(parent)) {
          parent2Children.get(parent).push(node)
        } else {
          parent2Children.set(parent, [node])
        }
      })
      const parents = unique(Array.from(parent2Children.keys()))
      // add new tree parent node
      const newNodesV = []
      const newNodesH = []
      const newH2v = new Map()
      parents.forEach(parent => {
        const children = parent2Children.get(parent)
        const verticalNodes = children.map(child => h2v.get(child))
        const nodeList = children.reduce((list, node) => list.concat(node.nodeList), [])
        const newNode = this.tree.addNode(TreeNodeType.INTERNAL, nodeList, children)
        newNodesH.push(newNode)
      })
      currentNodesH = newNodesH
    }
    return currentNodes[0]
  }

  /**
   * @param {AggrTreeNode[]} nodes
   */
  buildTreeLevel(nodes) {

  }

  /**
   * @param {AggrTreeNode} treeNode
   */
  getBLayerSuccessors(treeNode) {
    let successors = []
    treeNode.getOutEdges().forEach(e => {
      const successor = this.gNodeId2TreeNode.get(e.dst.id).parent
      successors.push(successor)
    })
    successors = unique(successors)
    return successors
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

  /**
   * @param {AggrTreeNode[]} tNodes
   */
  mergeClusterByNodes(tNodes) {
    const nodeSet = new Set(nodes)
    // modify graph

    let newNode = this.hGraph.addNode(computeUUID(), vld)

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

