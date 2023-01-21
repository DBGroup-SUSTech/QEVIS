export class UnionFind {
  map = new Map()

  add(item) {
    this.map.set(item, item)
  }

  has(item) {
    return this.map.has(item)
  }

  union(item2, id2) {
    const root1 = this.find(item2)
    const root2 = this.find(id2)
    this.map.set(root1, root2)
  }

  find(item) {
    if (item === this.map.get(item)) {
      return item
    } else {
      const root = this.find(this.map.get(item))
      this.map.set(item, root)
      return root
    }
  }

  /**
   * @returns {any[][]}
   */
  getAllUnions() {
    const unionMap = new Map()
    Array.from(this.map.keys()).forEach(item => {
      const mainItem = this.find(item)
      if (unionMap.has(mainItem)) {
        unionMap.get(mainItem).push(item)
      } else {
        unionMap.set(mainItem, [item])
      }
    })
    return Array.from(unionMap.values())
  }
}
