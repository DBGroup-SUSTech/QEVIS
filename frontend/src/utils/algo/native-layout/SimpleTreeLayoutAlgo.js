export class SimpleTreeLayoutAlgo {
    rootId
    /** @type {Graph<VertexLayoutData, EdgeLayoutData>} */
    graph
    gapPixel

    /** @type {Set<(number|string)>} */
    visitedSet;
    /** @type {Node<VertexLayoutData, EdgeLayoutData>[]} */
    orderedNodes;

    /**
     * @param {(string|number)} rootId
     * @param {Graph<VertexLayoutData, EdgeLayoutData>} graph
     * @param {number} gapPixel
     */
    constructor(rootId, graph, gapPixel) {
        this.rootId = rootId
        this.graph = graph
        this.gapPixel = gapPixel;
    }

    solve() {
        const root = this.graph.nodeMap.get(this.rootId);
        this.visitedSet = new Set();
        this.orderedNodes = [];
        this.recursive(root);

        this.orderedNodes.forEach((node, i) => {
            node.data.y = i;
        });

        this.graph.edges.forEach(edge => {
            edge.data.isHidden = false;
            if (edge.src.data.x1 < edge.dst.data.x0) {
                edge.data.turningX = (edge.src.data.x1 + edge.dst.data.x0) / 2;
            } else if (edge.src.data.x1 + this.gapPixel < edge.dst.data.x1) {
                edge.data.turningX = edge.src.data.x1 + this.gapPixel;
            } else {
                edge.data.turningX = (edge.src.data.x1 + edge.dst.data.x1) / 2;
            }
        });
    }

    recursive(node) {
        node.inEdges.forEach(e => {
            if (this.visitedSet.has(e.src.id)) {
                return;
            }
            this.visitedSet.add(e.src.id);

            this.recursive(e.src);
        });
        this.orderedNodes.push(node);
    }
}
