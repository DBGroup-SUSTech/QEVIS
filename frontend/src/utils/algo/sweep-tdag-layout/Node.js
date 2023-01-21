export class Node {
  /** @type {(string|number)} */
  id
  /** @type {number} */
  x0
  /** @type {number} */
  x1

  /** @type {Tick[]} */
  ticks = []

  /** @type {VirtualNode[]} */
  vNodes = []
  /** @type {Edge[]} */
  inEdges = []
  /** @type {Edge[]} */
  outEdges = []

  constructor(id, x0, x1) {
    this.id = id
    this.x0 = x0
    this.x1 = x1
  }
}
