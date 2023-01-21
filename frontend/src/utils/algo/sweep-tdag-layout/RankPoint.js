/**
 * @enum {string}
 * @readonly
 */
export const RankPointType = {
  NODE_START: 'node-start',
  NODE_END: 'node-end',
  NODE_INTER: 'node-inter',
  EDGE_INTER: 'edge-inter'
}

export class RankPoint {
  /** @type {number} */
  id
  /** @type {RankPointType} */
  type
  /** @type {Node} */
  node
  /** @type {Edge} */
  edge
  /** @type {RankPoint[]} */
  successors
  /** @type {RankPoint[]} */
  precursors

  constructor(id, type) {
    this.id = id
    this.type = type
    this.successors = []
    this.precursors = []
  }
}
