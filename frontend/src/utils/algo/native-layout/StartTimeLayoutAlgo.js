export class StartTimeLayoutAlgo {
    rootId
    /** @type {Graph<VertexLayoutData, EdgeLayoutData>} */
    graph
    gapPixel

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
        const nodes = [...this.graph.nodes];
        nodes.sort((n0, n1) => n0.data.x0 - n1.data.x0);
        nodes.forEach((node, i) => {
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
}
