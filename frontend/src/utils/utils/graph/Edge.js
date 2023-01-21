/**
 * @template T, U
 */
export class Edge {
  /** @type {string} */
  id
  /** @type {U} */
  data
  /** @type {Node<T, U>} */
  src
  /** @type {Node<T, U>} */
  dst

  /**
   * @param {Node<T, U>} src
   * @param {Node<T, U>} dst
   * @param {U} data
   */
  constructor(src, dst, data=null) {
    this.id = Edge.getEdgeId(src, dst)
    this.src = src
    this.dst = dst
    this.data = data
  }

  /**
   * @param {Node<T, U>} src
   * @param {Node<T, U>} dst
   * @returns {string}
   */
  static getEdgeId(src, dst) {
    return src.id + '-' + dst.id
  }
}
