/**
 * @enum {string}
 * @readonly
 */
export const TreeNodeType = {
  ROOT: 'root',
  INTERNAL: 'internal',
  LEAF: 'leaf',
}

export class AggrTreeNode {
  /** @type {(number|string)} */
  id
  /** @type {TreeNodeType} */
  type
  /** @type {AggrTreeNode} */
  parent
  /** @type {AggrTreeNode[]} */
  children

  /** @type {Node[]} original node list */
  nodeList

  constructor(id) {
    this.id = id
    this.children = []
    this.nodeList = []
  }

  getOutEdges() {
    const nodeSet = new Set(this.nodeList)
    const outEdges = []
    this.nodeList.forEach(node => {
      const filterEdges = node.outEdges.filter(e => !nodeSet.has(e.dst))
      outEdges.push(...filterEdges)
    })
    return outEdges
  }

  getInEdges() {
    const nodeSet = new Set(this.nodeList)
    const inEdges = []
    this.nodeList.forEach(node => {
      const filterEdges = node.inEdges.filter(e => !nodeSet.has(e.src))
      inEdges.push(...filterEdges)
    })
    return inEdges
  }
}
