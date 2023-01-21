<template>
    <svg>
        <g class="rootContainer">
            <rect :width="containerWidth" :height="containerHeight"
                  fill="none"
            ></rect>
            <g class="container">
                <g v-if="loaded">
                    <DagNode v-for="node in nodes" :key="node.vid" :node="node"
                             @mouseenter.native="enterDagNode(node)"
                             @mouseleave.native="leaveDagNode(node)"></DagNode>
                    <g :transform="'translate(' + linkTranslate + ')'">
                        <DagLink v-for="edge in edges" :key="edge.eid" :edge="edge"></DagLink>
                    </g>
                </g>
                <g v-if="!loaded">
                    <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
                        No data selected
                    </text>
                </g>
            </g>
            <g class="operatorContainer" :transform="'translate('+[containerWidth, 10]+')'">

            </g>
        </g>
        <g class="legendContainer" v-show="loaded">
        </g>
        <g v-show="app.showDetail"
           :transform="'translate('+[containerWidth - 110, 5]+')'">
            <rect width="105" height="65" x="0" y="0" rx="3" ry="3"
                  :fill="'rgba(236,236,236,0.75)'"/>
            <g class="detail-container"></g>
        </g>
    </svg>
</template>

<script>

    // import Vertex from "@/components/Vertex";
    import * as d3 from "d3"
    import dagre from 'dagre';
    import DagNode from "@/components/DagNode";
    import DagLink from "@/components/DagLink";
    import {mapState} from "vuex";

    export default {
        name: "DAGDiagram",
        props: ['app'],
        components: {
            DagNode,
            DagLink
            // Vertex
        },

        data() {
            return {
                margin: {top: 20, right: 20, bottom: 50, left: 10},
                containerWidth: 0,
                containerHeight: 0,
                nodeContainerHeight: 30,
                nodeBarHeight: 25,
                /** @type {(Vertex & VertexDAG)[]} */
                nodes: [],
                /** @type {Edge[]} */
                edges: [],
                stepColorEncoding: {
                    "Initialization": "#a6cee3",
                    "Shuffle": "#1f78b4",
                    "Processor": "#b2df8a",
                    "Sink": "#e31a1c",
                    "Output": "#ff7f00",
                    "Spill": "#cab2d6",
                    "Input": "#984ea3"
                },
                nodeWidth: 50,
                nodeHeight: 20,

                zoom: null,
            }
        },
        mounted() {
            this.containerHeight = this.$el.clientHeight;
            this.containerWidth = this.$el.clientWidth;  // hardcode
            let legends = ['Map', 'Reducer']
            let container = d3.select(this.$el).select(".legendContainer")
            let textContainers = container.selectAll('.textContainer')
                .data(legends).enter().append('g').attr('class', 'textContainer')
                .attr('transform', (d, i) => "translate(" + [this.containerWidth - 72, this.containerHeight - 30 + 15 * i] + ')')
            textContainers.append('rect').attr('width', 10).attr('height', 10)
                .attr('fill', d => {
                    const color = d3.color(this.colorSchema[d])
                    color.opacity = 0.5
                    return color.toString()
                })
                .attr('stroke', 'grey')
                .attr('stroke-width', '1');
            textContainers.append('text').text(d => d).attr('y', 9.5).attr('x', 15).style('font-size', '13px');

            this.svg = d3.select(this.$el);
            let zoom = d3.zoom()
                .scaleExtent([-13, 12])
            this.zoom = zoom;
            zoom.on('zoom', () => {
                this.svg.select('.rootContainer').attr('transform', d3.event.transform);
                // zoom.transform(this.svg.select('.rootContainer'), d3.event.transform)
            });
            this.svg.call(zoom);
            // const transform = d3.zoomTransform(this.svg.node).apply([-100, 0]).scale(0.8)
            // zoom.transform(this.svg, transform)
            // zoom.scaleTo(this.svg, 0.8)
            // zoom.translateBy(this.svg, -this.containerWidth * 0.2, 0);

            this.render();
        },
        methods: {
            render() {
                this.renderDagDiagram()
                this.drawAppInfo()
            },
            renderDagDiagram() {
                const vertexes = this.app.vertexes ?? [];
                const edges = this.app.edges ?? [];

                if (vertexes.length === 0 || edges.length === 0) {
                    return;
                }

                const visNodes = [];
                vertexes.forEach(node => {
                    const viewObj = node.createDagViewObj();
                    viewObj.height = this.nodeHeight;
                    viewObj.width = this.nodeWidth;
                    visNodes.push(viewObj);
                });
                const visEdges = [];
                edges.forEach(edge => {
                    const viewObj = edge.createDagViewObj();
                    viewObj.points = [];
                    visEdges.push(viewObj);
                });

                let g = new dagre.graphlib.Graph();
                g.setGraph({});
                g.setDefaultEdgeLabel(function () {
                    return {};
                });

                visNodes.forEach(node => {
                    g.setNode(node.vid, node);
                })
                edges.forEach((edge, i) => {
                    g.setEdge({v: edge.src.vid, w: edge.dst.vid, minLen: i === 0 ? 5 : 1});
                });
                g.graph().rankDir = 'LR';
                g.graph().nodesep = '3';
                g.graph().edgesep = '10';
                g.graph().ranksep = '10';
                g.graph().marginy = '10';
                g.graph().marginx = '10';
                dagre.layout(g);

                this.nodes = [...visNodes];
                this.edges = [...visEdges];
                // console.log(this.nodes, this.edges);

                // g.nodes().forEach(function(v) {
                //     console.log("Node " + v + ": " + JSON.stringify(g.node(v)));
                // });
                // g.edges().forEach(function(e) {
                //     console.log("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(g.edge(e)));
                // });

                this.edges.forEach(edge => {
                    edge.points = g.edge({v: edge.src.vid, w: edge.dst.vid}).points
                })

                let xRange = d3.extent(this.nodes, node => node.x);
                let yRange = d3.extent(this.nodes, node => node.y);
                let _x1 = xRange[0], _x2 = xRange[1] + this.nodeWidth, _y1 = yRange[0],
                    _y2 = yRange[1] + this.nodeHeight;

                d3.select(this.$el).select('g.container')
                    .attr('transform',
                        'translate(' + [(this.containerWidth - (_x2 - _x1)) / 2 - _x1, (this.containerHeight - (_y2 - _y1)) / 2 - _y1] + ')')

                let scale = Math.min(this.containerWidth / (_x2 - _x1), this.containerHeight / (_y2 - _y1));
                this.zoom.scaleTo(this.svg, scale * 0.95)
            },
            clickNode(a) {
                console.log('click', a)
            },
            enterDagNode(node) {
                this.$store.commit('comparison/changeHighlightVertex', {
                    app: this.app,
                    vertex: node._mainObj,
                    toHighlight: true,
                });
            },
            leaveDagNode(node) {
                this.$store.commit('comparison/changeHighlightVertex', {
                    app: this.app,
                    vertex: node._mainObj,
                    toHighlight: false,
                });
            },
            drawAppInfo() {
                const detailContainer = d3.select(this.$el).select('.detail-container')

                const duration = this.app.duration
                const machineCnt = this.app.machineNo
                const mapCnt = this.app.mapNo
                const reducerCnt = this.app.reducerNo
                const taskCnt = this.app.taskNo

                const labels = ['Duration', 'Machine No.', 'Map No.', 'Reducer No.', 'Task No.']
                const values = [Math.round(duration / 1000) + 's', machineCnt, mapCnt, reducerCnt, taskCnt]
                const rows = detailContainer.selectAll('g').data(labels).enter().append('g')
                    .attr('transform', (d, i) => 'translate(' + [5, 12 * i + 11] + ')')
                rows.append('text')
                    .text(d => d)
                    .style('font-size', '11px')
                rows.append('text')
                    .text((d, i) => values[i])
                    .attr('dx', 70)
                    .style('font-size', '11px')
            }
        },
        watch: {
            //add for simulation update
            dagRenderSign() {
                this.render();
            },
            selectedVertex(vertex) {
                d3.select('.operatorContainer').selectAll('g').remove();
                let container = d3.select('.operatorContainer').append('g');
                if (vertex == null) return
                console.log('watch selected vertex', vertex);


                let detailStructureContainer = container;
                let infoContainerHeight = 30;
                let infoHeightGap = 10;
                let node = vertex;


                let attrWidth = 200, attrUnitHeight = 20;
                let steps = node.vdat.step_list;
                let nodeWidth = 120, nodeHeight = 30, nodeConnections = [];
                let currentSumAttrHeight = 0;
                for (let i = 0, ilen = steps.length; i < ilen; i++) {
                    steps[i].x = 0, steps[i].y = i * (infoContainerHeight + infoHeightGap);
                    let keys = Object.keys(steps[i].attr_dict);
                    let currentHeight = keys.length * attrUnitHeight;
                    steps[i].attrX = 300;
                    steps[i].width = nodeWidth;
                    steps[i].height = nodeHeight;
                    steps[i].attrY = currentSumAttrHeight;
                    steps[i].attrHeight = currentHeight;
                    steps[i].attrWidth = attrWidth;
                    currentSumAttrHeight += (currentHeight + infoHeightGap);
                    if (i == 0) continue;
                    nodeConnections.push({'src': steps[i - 1], 'dst': steps[i]})
                }

                detailStructureContainer
                    .append('circle').attr('r', 2).attr('stroke-width', 1).attr('fill', 'black')
                    .attr('cy', 0).attr('fill', 'white').attr('stroke', 'black');
                detailStructureContainer.selectAll('*').remove();
                detailStructureContainer.selectAll('.detailLine').data(nodeConnections).enter().append('line').attr('class', 'detailLine')
                    .attr('x1', d => d.src.x + nodeWidth / 2).attr('y1', d => d.src.y + nodeHeight)
                    .attr('x2', d => d.dst.x + nodeWidth / 2).attr('y2', d => d.dst.y)
                    .attr('stroke', 'grey').attr('stroke-width', 2);

                //Draw details
                let rectContainers = detailStructureContainer.selectAll('.detailNode')
                    .data(steps).enter().append('g').attr('class', 'detailNode').attr('transform', (d) => 'translate(' + [0, d.y] + ')');

                rectContainers.append('rect')
                    .attr("width", nodeWidth).attr('height', nodeHeight).attr('stroke-width', 1).attr('stroke', 'grey')
                    .attr('fill', 'none');

                let titles = rectContainers.append('text').text(d => d.step_name).style('font-size', 10).attr('fill', 'black');
                titles.each(function () {
                    let title = d3.select(this);
                    let boundaryRect = title.node().getBoundingClientRect();
                    title.attr('dx', (nodeWidth - boundaryRect.width) / 2).attr('dy', boundaryRect.height / 2 + nodeHeight / 2 - 2);
                });

                // Draw attributes
                let attrContainers = detailStructureContainer.selectAll('.attrNode')
                    .data(steps).enter().append('g').attr('class', 'attrNode').attr('transform', (d) => 'translate(' + [d.attrX, d.attrY] + ')');

                attrContainers.each(function (d) {
                    let _container = d3.select(this);
                    let strList = [];
                    for (let key in d.attr_dict) {
                        strList.push(key + ": " + d.attr_dict[key]);
                    }
                    let boundaryRect = _container.append('rect')
                        .attr("width", d => d.attrWidth).attr('height', d => d.attrHeight).attr('stroke-width', 1)
                        .attr('stroke', 'grey').attr('fill', 'none').attr('fill-opacity', 0.6);
                    let titleContainers = _container.selectAll('.title')
                        .data(strList).enter().append('g')
                        .attr('transform', (d, i) => 'translate(' + [0, (i + 0.5) * attrUnitHeight] + ')');
                    let maxCellWidth = 0;
                    titleContainers.each(function (d) {
                        let _container = d3.select(this);
                        let title = _container.append('text').attr('class', 'title').text(d).attr('font-size', 10);
                        let boundaryRect = title.node().getBoundingClientRect();
                        maxCellWidth = Math.max(boundaryRect.width, maxCellWidth);
                    });
                    d.attrWidth = maxCellWidth;
                    boundaryRect.attr('width', d => d.attrWidth);
                    _container.attr('transform', d => 'translate(' + [d.attrX, d.attrY] + ')')
                });

                let nodeAttrLineContainer = detailStructureContainer.selectAll('.nodeAttrLine')
                    .data(steps).enter().append('g').attr('class', 'nodeAttrLine')

                nodeAttrLineContainer.each(function (d) {
                    let _container = d3.select(this);
                    let srcX = d.x + d.width, srcY = d.y + d.height / 2, dstX = d.attrX,
                        dstY = d.attrY + d.attrHeight / 2;
                    // let dx = srcX - dstX;
                    let points = [{x: srcX, y: srcY},
                        // {x: srcX - dx * 1/ 4, y: srcY},
                        // {x: dstX + dx * 1/ 4, y: dstY},
                        {x: dstX, y: dstY}];
                    let Gen = d3.line()
                        .x((p) => p.x).y((p) => p.y).curve(d3.curveBasis);
                    _container.append('path').attr('stroke-width', 1).attr('d', Gen(points)).attr('stroke', 'grey').attr('fill', 'none')
                })

            },
        },
        computed: {
            ...mapState('comparison', {
                dagRenderSign: state => state.dagRenderSign,
                colorSchema: state => state.colorSchema,
                selectedVertex: state => state.selectedVertex
            }),
            dagRenderSign() {
                return this.app.signs.dagSign;
            },
            loaded() {
                return !(this.nodes.length === 0 && this.edges.length === 0);
            },
            linkTranslate() {
                // return [0, 0]
                if (!this.nodeWidth || !this.nodeHeight) return [0, 0]
                return [this.nodeWidth / 2, this.nodeHeight / 2]
            },
        },
    }
</script>

<style scoped>

</style>
