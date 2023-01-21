class CompoundNode {
  id
  nodes
  layout = {x: 0, y: 0, width: 0, height: 0}

  outEdges = []
  inEdges = []

  constructor(id, nodes) {
    this.id = id
    this.nodes = nodes
  }

  setLayout({x, y, width, height}) {
    this.layout.x = x
    this.layout.y = y
    this.layout.width = width
    this.layout.height = height
  }
}

class CompoundEdge {
  id
  src
  dst

  points

  constructor(src, dst) {
    this.id = src.id + '_' + dst.id
    this.src = src
    this.dst = dst
  }

  getStartEndPoints() {
    let sx = this.src.layout.x + this.src.layout.width,
        sy = this.src.layout.y + this.src.layout.height / 2,
        dx = this.dst.layout.x,
        dy = this.dst.layout.y + this.dst.layout.height / 2
    return [{x: sx, y: sy}, {x: dx, y: dy}]
  }

  setPoints(points) {
    this.points = points
  }
}

class CompoundGraph {
  nodes = []
  nodesMap = new Map()

  edges = []

  /**
   * Add a compound node to the graph
   * @param {String|Number} id The id of new node
   * @param nodes All nodes include in this compound node
   * @returns {CompoundNode}
   */
  addNode(id, nodes) {
    let node = new CompoundNode(id, nodes)
    this.nodes.push(node)
    this.nodesMap.set(id, node)
    return node
  }

  addEdge(id1, id2) {
    let cNode1 = this.nodesMap.get(id1),
        cNode2 = this.nodesMap.get(id2)
    let cEdge = new CompoundEdge(cNode1, cNode2)
    cNode1.outEdges.push(cEdge)
    cNode2.inEdges.push(cEdge)
    this.edges.push(cEdge)
    return cEdge
  }

  getNode(id) {
    return this.nodesMap.get(id)
  }
}

export {
  CompoundGraph, CompoundNode, CompoundEdge
}
