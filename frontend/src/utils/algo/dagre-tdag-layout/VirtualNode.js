export class VirtualNode {
  /** @type {number} */
  id
  /** @type {number} */
  rank
  /** @type {Node} */
  realNode

  inVEdges = []
  outVEdges = []

  constructor(id, rank, realNode) {
    this.id = id
    this.rank = rank
    this.realNode = realNode
  }

}
