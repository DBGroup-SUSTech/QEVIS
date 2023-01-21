import {VertexLayoutData} from "@/utils/entities/VertexLayoutData";
import {GreedyLayoutAlgo} from "@/utils/algo/greedy-tdag-layout/GreedyLayoutAlgo";

export class VisHierarchyGraph {
    /** @type {Graph<AggrTreeNode, any>} */
    graph

    /** @type {Node<VisNodeData, any>[]} */
    nodes = []
    /** @type {Map<(number|string), Node<VisNodeData, any>>} */
    nodeMap = new Map()
    /** @type {Edge<VisNodeData, any>[]} */
    edges = []
    /** @type {Map<string, Edge<VisNodeData, any>>} */
    edgeMap = new Map()

    /** @type {Map<(number|string), Node<VisNodeData, any>>} */
    vertexName2Node = new Map()   // vertexName => node

    /**
     * @typedef TDAGLayoutConfig
     * @property {string} dagRoot
     * @property {number} gapPixel
     * @property {Map<(string|number), number>} orderMap
     * @property {number} vertexContainerHeight
     */

    /**
     * @typedef StepData
     * @property {number} stepId
     * @property {number} time
     * @property {number} offsetX
     * @property {number} width
     * @property {string} color
     * @property {string} name
     */

    // /**
    //  * @param {HierarchyGraph} hGraph
    //  * @param {TDAGLayoutConfig} tdagLayoutConfig
    //  */
    /**
     * @param {HierarchyGraph} hGraph
     * @param {TDAGLayoutConfig} tdagLayoutConfig
     */
    constructor(hGraph, tdagLayoutConfig) {
        this.graph = hGraph.graph
        this.init(tdagLayoutConfig)
    }

    init({dagRoot, gapPixel, orderMap, vertexContainerHeight, marginTop}) {
        // convert AggrTreeNode layoutGraph to layoutData layoutGraph
        /** @type {Graph<VertexLayoutData, any>} */
        const layoutGraph = this.graph.copy()   // force convert
        layoutGraph.nodes.forEach(gNode => {
            const nodes = gNode.data.nodeList
            gNode.data = new VertexLayoutData(
                Math.min(...nodes.map(n => n.data.x0)),
                Math.max(...nodes.map(n => n.data.x1)),
                0,
                gNode.id,
                nodes.reduce((list, node) => list.concat(node.data.vertexIdList), [])
            )    // overwrite it
        })
        // layout
        let root = layoutGraph.nodes.find(n => n.data.vertexIdList.includes(dagRoot))
        // let root = app.
        // root = root === undefined ? app.vertexes[app.vertexes.length - 1] : root;
        if (root === undefined) {
            let node = layoutGraph.addNode("virtualRoot",
                new VertexLayoutData(-100, 100, 0, "virtualRoot", ["virtualRoot"]))
            layoutGraph.nodes.forEach(n => {
                if (n.outEdges.length === 0 && n.id !== "virtualRoot") {
                    layoutGraph.addEdge(n.id, node.id)
                }
            })
            root = node;
            orderMap[root.id] = 100
        }
        // root = root === undefined ? layoutGraph.nodes[0] : root;
        // console.log("root", root, layoutGraph.nodes)
        let greedyLayoutAlgo = new GreedyLayoutAlgo(root.id, layoutGraph, gapPixel, orderMap)
        greedyLayoutAlgo.solve()
        if (root.id === "virtualRoot") {
            // layoutGraph.removeNode(root)
        }
        greedyLayoutAlgo.setResultToGraph(vertexContainerHeight)

        // convert to this
        Object.assign(this, this.graph.copy())
        this.nodes.forEach(node => {
            const hGraphNode = this.graph.nodeMap.get(node.id)
            const data = layoutGraph.nodeMap.get(node.id).data
            node.data = new VisNodeData(data.x0, data.x1, data.y + marginTop,
                hGraphNode, data.vertexIdList)
        })

        this.computeVertexMap()
    }

    /**
     * @param {{}} vertexMap vtxName => vertex
     * @param xScale
     * @param layoutConfig
     */
    computeStepLayout(vertexMap, xScale, layoutConfig) {
        this.nodes.forEach(node => {
            const vertices = node.data.vertexIdList.map(vtxName => vertexMap[vtxName])
            const stepSums = []
            vertices.forEach(vertex => {
                vertex.steps.forEach((step, i) => {
                    if (stepSums.length <= i) {
                        stepSums.push(0)
                    }
                    stepSums[i] += step
                })
            })

            const startTime = Math.min(...vertices.map(v => v.startTime))
            const endTime = Math.max(...vertices.map(v => v.endTime))
            const duration = endTime - startTime

            let offsetX = 0
            const stepDataList = []
            const vertexWidth = xScale(duration) - xScale(0)
            const stepSumSum = stepSums.reduce((a, b) => a + b, 0)
            stepSums.forEach((stepSum, i) => {
                const widthRate = duration === 0 ? 0 : stepSum / stepSumSum;
                /** @type {StepData} */
                const stepData = {
                    stepId: i,
                    time: stepSum,
                    offsetX: offsetX,
                    width: widthRate * vertexWidth,
                    color: layoutConfig.stepColors[i],
                    name: layoutConfig.stepName['Map'][i],    // need to fix
                }
                offsetX += stepData.width
                stepDataList.push(stepData)
            })
            node.data.stepDataList = stepDataList
        })
    }

    computeVertexMap() {
        this.nodes.forEach(node => {
            node.data.vertexIdList.forEach(vertexName => {
                this.vertexName2Node.set(vertexName, node)
            })
        })
    }
}

export class VisNodeData {
    /** @type {{x0: number, x1: number, y: number,
     * selectAsProvider: boolean, selectCurrent: boolean, selectAsConsumer: boolean}}*/
    layout

    /** @type {StepData[]} */
    stepDataList

    /** @type {(number|string)[]} */
    vertexIdList

    /** @type {Node<AggrTreeNode, any>}*/
    hGraphNode

    /**
     * @param {number} x0
     * @param {number} x1
     * @param {number} y
     * @param {Node<AggrTreeNode, any>} hGraphNode
     * @param {(number|string)[]} [vertexIdList=[]]
     */
    constructor(x0, x1, y, hGraphNode, vertexIdList = []) {
        this.layout = {x0, x1, y, selectAsProvider: false, selectCurrent: false, selectAsConsumer: false}
        this.hGraphNode = hGraphNode
        this.vertexIdList = vertexIdList
    }
}
