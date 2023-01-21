import {removeItemFrom} from "../array/arrayUtils"
import {Edge} from "./Edge"
import {Node} from "./Node"

/**
 * @template T, U
 */
export class Graph {
    /** @type {Node<T, U>[]} */
    nodes = []
    /** @type {Map<(number|string), Node<T, U>>} */
    nodeMap = new Map()
    /** @type {Edge<T, U>[]} */
    edges = []
    /** @type {Map<string, Edge<T, U>>} */
    edgeMap = new Map()

    /**
     * @param {(number|string)} id
     * @param {T} [data=null]
     * @returns {Node<T, U>}
     */
    addNode(id, data = null) {
        let node = new Node(id, data)
        this.nodes.push(node)
        this.nodeMap.set(id, node)
        return node
    }

    /**
     * @param {Node<T, U>} node
     */
    removeNode(node) {
        if (!this.nodeMap.has(node.id)) {
            return
        }
        removeItemFrom(this.nodes, node)
        this.nodeMap.delete(node.id)
        node.inEdges.concat(node.outEdges)
            .forEach(e => this.removeEdge(e))
    }

    /**
     * @param {(number|string)} id
     */
    removeNodeById(id) {
        let node = this.nodeMap.get(id)
        if (!node) {
            return
        }
        this.removeNode(node)
    }

    /**
     * @param {(number|string)} srcId
     * @param {(number|string)} dstId
     * @param {U} [data=null]
     * @returns {Edge<T, U>}
     */
    addEdge(srcId, dstId, data = null) {
        let src = this.nodeMap.get(srcId)
        let dst = this.nodeMap.get(dstId)
        if (src === undefined || dst === undefined) {
            return null
        }

        let edge = new Edge(src, dst, data)

        src.outEdges.push(edge)
        dst.inEdges.push(edge)
        this.edges.push(edge)
        this.edgeMap.set(edge.id, edge)
        return edge
    }

    /**
     * @param {Edge<T, U>} edge
     */
    removeEdge(edge) {
        if (!this.edgeMap.has(edge.id)) {
            return
        }
        removeItemFrom(this.edges, edge)
        this.edgeMap.delete(edge.id)
        removeItemFrom(edge.src.outEdges, edge)
        removeItemFrom(edge.dst.inEdges, edge)
    }

    /**
     * @param {string} edgeId
     */
    removeEdgeById(edgeId) {
        let edge = this.edgeMap.get(edgeId)
        if (!edge) {
            return
        }
        this.removeEdge(edge)
    }

    /**
     * @returns {Graph<T, U>}
     */
    copy() {
        let g = new Graph()
        this.nodes.forEach(n => g.addNode(n.id, n.data))
        this.edges.forEach(e => g.addEdge(e.src.id, e.dst.id))
        return g
    }
}
