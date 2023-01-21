/**
 * @template T, U
 */
export class Node {
  /** @type {(number|string)} */
  id
  /** @type {T} */
  data
  /** @type {Edge<T, U>[]} */
  outEdges = []
  /** @type {Edge<T, U>[]} */
  inEdges = []

  /**
   * @param {(number|string)} id
   * @param {T} data
   */
  constructor(id, data=null) {
    this.id = id
    this.data = data
  }
}
