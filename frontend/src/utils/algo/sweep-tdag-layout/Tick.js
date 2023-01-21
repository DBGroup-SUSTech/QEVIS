export class Tick {
  /** @type {number} */
  id
  /** @type {Node} */
  node
  /** @type {string} start or end */
  type
  /** @type {number} */
  rank

  constructor(id, node, type) {
    this.id = id
    this.node = node
    this.type = type
  }

  getX() {
    if (this.type === 'start') return this.node.x0
    else return this.node.x1
  }
}
