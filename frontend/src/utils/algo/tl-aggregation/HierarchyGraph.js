import {AggrTree} from "./AggrTree";
import {TreeNodeType} from "./AggrTreeNode";
import {Edge, Graph} from "../../utils/graph";
import {computeUUID} from "@/utils/utils/uuid";

export class HierarchyGraph {
  /**
   * @type {Graph<AggrTreeNode, any>}
   * Visual graph.
   * Represent a visible layer on the aggregation tree
   */
  graph

  // /** @type {number} */
  // autoIncrId = 0
  /** @type {AggrTree} */
  tree

  /** @type {AggrTreeNode[]} */
  leaves = []
  /** @type {Map<string, AggrTreeNode>} */
  originalId2leaf   // the id of original gNode

  /**
   * @type {Map<number, Node<AggrTreeNode, any>>}
   * Notice that here the gNode is not origin gNode.
   * If a tNodeId has corresponding gNode, it means that this tNode is in vis graph
   */
  tNodeId2gNode

  /**
   * @param {Graph<any, any>} originGraph
   */
  constructor(originGraph) {
    this.graph = new Graph()
    this.tree = new AggrTree()
    this.init(originGraph)
  }

  /**
   * @param {Graph<any, any>} originGraph
   */
  init(originGraph) {
    this.originalId2leaf = new Map()
    this.tNodeId2gNode = new Map()
    originGraph.nodes.forEach(node => {
      // add new gNode
      const tNode = this.tree.addNode(TreeNodeType.LEAF, [node])
      const gNode = this.graph.addNode(node.id, tNode)
      this.leaves.push(tNode)
      this.originalId2leaf.set(node.id, tNode)
      this.tNodeId2gNode.set(tNode.id, gNode)
    })
    originGraph.edges.forEach(edge => {
      const tNode1 = this.originalId2leaf.get(edge.src.id),
            tNode2 = this.originalId2leaf.get(edge.dst.id)
      this.graph.addEdge(this.tNodeId2gNode.get(tNode1.id).id,
        this.tNodeId2gNode.get(tNode2.id).id)
    })
  }

  /**
   * @param {AggrTreeNode[]} nodes
   * @returns {Node<AggrTreeNode, any>}
   */
  mergeNodes(nodes) {
    const gNodes = nodes.map(tNode => this.tNodeId2gNode.get(tNode.id))
    const originNodes = nodes.reduce((list, node) => list.concat(node.nodeList), [])

    // modify graph
    const newTNode = this.tree.addNode(TreeNodeType.INTERNAL, originNodes, nodes)
    nodes.forEach(child => child.parent = newTNode)
    const newNode = this.graph.addNode(computeUUID(), newTNode)

    this.replaceNodes(gNodes, newNode)
    nodes.forEach(tNode => this.tNodeId2gNode.delete(tNode.id))
    this.tNodeId2gNode.set(newTNode.id, newNode)

    return newNode
  }

  /**
   * @param {AggrTreeNode} parentNode
   */
  aggregateNodeByParent(parentNode) {
    if (this.tNodeId2gNode.has(parentNode.id)) {
      console.warn('cannot merge node')
      return
    }
    parentNode.children.forEach(child => {
      if (!this.tNodeId2gNode.has(child.id)) {
        this.aggregateNodeByParent(child)
      }
    })
    const removeNodes = parentNode.children.map(child => this.tNodeId2gNode.get(child.id))
    const newNode = this.graph.addNode(computeUUID(), parentNode)
    this.replaceNodes(removeNodes, newNode)
    parentNode.children.forEach(tNode => this.tNodeId2gNode.delete(tNode.id))
    this.tNodeId2gNode.set(parentNode.id, newNode)
  }

  /**
   * @param {Node<AggrTreeNode,any>[]} removeNodes
   * @param {Node<AggrTreeNode,any>} newNode
   */
  replaceNodes(removeNodes, newNode) {
    const removeSet = new Set(removeNodes)

    const inEdges = removeNodes.map(gNode => gNode.inEdges).flat()
        .filter(e => !removeSet.has(e.src))
    const outEdges = removeNodes.map(gNode => gNode.outEdges).flat()
        .filter(e => !removeSet.has(e.dst))
    let precursors = inEdges.map(e => e.src)
    let successors = outEdges.map(e => e.dst)
    precursors = Array.from(new Set(precursors))    // AggrTreeNode
    successors = Array.from(new Set(successors))

    precursors.forEach(p => {
      // console.log('add 1', p.id)
      this.graph.addEdge(p.id, newNode.id)
    })
    successors.forEach(s => {
      // console.log('add 2', s.id)
      this.graph.addEdge(newNode.id, s.id)
    })
    removeNodes.forEach(gNode => this.graph.removeNode(gNode))
  }

  /**
   * @param {AggrTreeNode} node
   */
  expandNode(node) {
    const expandGNode = this.tNodeId2gNode.get(node.id)
    if (!expandGNode) {
      // it is not in the vis graph
      console.error('expand error')
      return
    }
    const childTNodes = node.children
    const childGNodes = []

    if (childTNodes.length === 0) {
      console.warn('can\'t expand as no child')
      return
    }

    // modify graph nodes
    this.graph.removeNode(expandGNode)
    this.tNodeId2gNode.delete(node.id)
    childTNodes.forEach(child => {
      const gNode = this.graph.addNode(computeUUID(), child)
      childGNodes.push(gNode)
      this.tNodeId2gNode.set(child.id, gNode)
    })

    const addedEdgeIdSet = new Set()
    childGNodes.forEach(gNode => {
      const originNodes = gNode.data.nodeList
      let precursors = originNodes
          .map(originNode => originNode.inEdges).flat()
          .map(e => e.src)
          .map(originPrecursor => this.originalId2leaf.get(originPrecursor.id))
      let successors = originNodes
          .map(originNode => originNode.outEdges).flat()
          .map(e => e.dst)
          .map(originPrecursor => this.originalId2leaf.get(originPrecursor.id))
      for (let i = 0; i < precursors.length; ++i) {
        while (!this.tNodeId2gNode.has(precursors[i].id)) {
          precursors[i] = precursors[i].parent
        }
      }
      for (let i = 0; i < successors.length; ++i) {
        while (!this.tNodeId2gNode.has(successors[i].id)) {
          successors[i] = successors[i].parent
        }
      }
      precursors = Array.from(new Set(precursors))
      successors = Array.from(new Set(successors))
      precursors = precursors.map(p => this.tNodeId2gNode.get(p.id))
        .filter(p => p.id !== gNode.id)
      successors = successors.map(s => this.tNodeId2gNode.get(s.id))
        .filter(s => s.id !== gNode.id)

      // console.log('for', gNode.data.nodeList[0])
      precursors.forEach(p => {
        // console.log('add 1', p.id)
        const edgeId = Edge.getEdgeId(p, gNode)
        if (addedEdgeIdSet.has(edgeId)) {
          return
        }
        addedEdgeIdSet.add(edgeId)
        this.graph.addEdge(p.id, gNode.id)
        // console.log('>>>>>', this.graph.addEdge(p.id, gNode.id))
      })
      successors.forEach(s => {
        // console.log('add 2', s.id)
        const edgeId = Edge.getEdgeId(gNode, s)
        if (addedEdgeIdSet.has(edgeId)) {
          return
        }
        addedEdgeIdSet.add(edgeId)
        this.graph.addEdge(gNode.id, s.id)
        // console.log('>>>>>', this.graph.addEdge(gNode.id, s.id))
      })
    })
  }
}
