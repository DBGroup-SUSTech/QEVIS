import {AggrTreeNode} from "@/utils/algo/tl-aggregation/AggrTreeNode";

export class AggrTree {
  /** @type {AggrTreeNode} */
  root
  /** @type {AggrTreeNode[]} */
  nodes
  /** @type {Map<number, AggrTreeNode>} */
  nodesMap

  /** @type {number} */
  autoIncrId = 0

  constructor() {
    this.nodes = []
    this.nodeMap = new Map()
  }

  /**
   * @returns {AggrTreeNode}
   */
  addNode(type, nodeList, children) {
    const newNode = new AggrTreeNode(this.autoIncrId++)
    this.nodes.push(newNode)
    this.nodeMap.set(newNode.id, newNode)

    if (type) newNode.type = type
    if (nodeList) newNode.nodeList = nodeList
    if (children) newNode.children = children

    return newNode
  }
}
