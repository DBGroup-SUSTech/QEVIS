export class VirtualEdge {
  /** @type {VirtualNode} */
  v
  /** @type {VirtualNode} */
  w

  /** @type {Edge} */
  realEdge

  constructor(v, w, realEdge=null) {
    this.v = v
    this.w = w
    this.realEdge = realEdge
  }
}
