<template>
    <svg>
        <rect :width="containerWidth" :height="containerHeight"
              fill="grey" fill-opacity="0.2"></rect>
        <!-- TODO: hard code, should be replaced by margin -->
        <g class="rootContainer" transform="translate(120,20)">
            <g class="summaryContainer" transform="translate(100,0)">
                <Vertex v-for="vertex in nodes"
                        :key="vertex.id"
                        :vertex="vertex"
                        :nodeContainerHeight="nodeContainerHeight"
                        :nodeBarHeight="nodeBarHeight"
                        :stepColorEncoding="stepColorEncoding"
                ></Vertex>
            </g>
            <g class="progressContainer"></g>
            <g class="detailStructure"></g>
        </g>
    </svg>
</template>

<script>
import * as d3 from "d3"
import Vertex from "@/components/Vertex";

export default {
    name: "DAGDiagram",
    components: {Vertex},
    data() {
        return {
            margin: {top: 20, right: 20, bottom: 50, left: 120},
            containerWidth: 0,
            containerHeight: 0,
            nodeContainerHeight: 30,
            nodeBarHeight: 25,
            nodes: [],
            stepColorEncoding: {
                "Initialization": "#a6cee3",
                "Shuffle": "#1f78b4",
                "Processor": "#b2df8a",
                "Sink": "#e31a1c",
                "Output": "#ff7f00",
                "Spill": "#cab2d6",
                "Input": "#984ea3"
            }
        }
    },
    mounted() {
        this.containerHeight = this.$el.clientHeight;
        this.containerWidth = this.$el.clientWidth;
    },
    watch: {
        dagData(solution) {
            console.log('newData', solution);
            let nodeContainerHeight = 30;

            let nodes = solution.vertexes;
            let edges = solution.edges;
            nodes.forEach(node => {
                if (node.vdat.vertex_name.startsWith('Map')) {
                    node.hv_type = 'Map'
                } else if (node.vdat.vertex_name.startsWith('Reducer')) {
                    node.hv_type = 'Reducer'
                } else {
                    node.hv_type = null
                }
            })
            let idNode = {};
            nodes.forEach(node => {
                idNode[node.idx] = node;
                node.children = [];
                node.preNodes = [];
                node.parent = null;
                node.vertex_name = node.vdat.vertex_name;
            })
            edges.forEach(edge => {
                let parentNode = idNode[edge.dst], childNode = idNode[edge.src];
                edge.srcNode = childNode, edge.dstNode = parentNode;
                parentNode.children.push(childNode), childNode.parent = parentNode, parentNode.preNodes.push(childNode)
            })

            let orderedNodes = [];
            let procNode = function (node) {
                if (node.children.length == 0) {
                    orderedNodes.push(node)
                    if (node.parent == null) return
                    node.parent.children.shift();
                    procNode(node.parent);
                } else {
                    procNode(node.children[0])
                }
            }
            procNode(nodes[0])

            // get the max time and min time
            let maxTime = d3.max(nodes, node => d3.max(node.vdat.tasks, task => task.end_time));
            let minTime = d3.min(nodes, node => d3.min(node.vdat.tasks, task => task.start_time));
            console.log('maxTime minTime', maxTime, minTime)
            //todo: change hard code length
            let xScale = d3.scaleLinear().domain([minTime, maxTime]).range([0, 1200]);
            let offsetY = 0, offsetYGap = 10;
            orderedNodes.forEach((node) => {
                // Calculate the start time and end time of each node
                node.startTime = d3.min(node.vdat.tasks, task => task.start_time);
                node.endTime = d3.max(node.vdat.tasks, task => task.end_time);
                node.layout = {
                    'x': xScale(node.startTime),
                    'width': xScale(node.endTime) - xScale(node.startTime),
                    'height': nodeContainerHeight
                }
                if (node.preNodes.length == 0) {
                    node.layout.y = offsetY;
                    offsetY += (nodeContainerHeight + offsetYGap);
                } else {
                    node.layout.y = d3.sum(node.preNodes, node => node.layout.y) / node.preNodes.length
                }
                if (node.layout.x == undefined) {
                    node.layout.x = 0;
                    node.layout.width = 5;
                }
                let _tasks = node.vdat.tasks;
                // Calculate the timespan of a node by max end time minus min start time from all tasks
                node.steps = [];
                if (_tasks.length > 0) {
                    for (let i = 0, ilen = _tasks[0].steps.length; i < ilen; i++) {
                        //Assume the order of the task.steps in a node have the same order
                        node.steps.push({
                            'name': _tasks[0].steps[i].name,
                            'value': d3.sum(_tasks, task => task.steps[i].value)
                        })
                    }
                }
                let sumStepValue = d3.sum(node.steps, step => step.value);
                let offsetX = 0;
                node.steps.forEach(step => {
                    let stepWidth = step.value / sumStepValue * node.layout.width;
                    step.width = stepWidth, step.x = offsetX;
                    offsetX += stepWidth;
                })
            })

            orderedNodes.forEach(node => {
                // deal with special node
                if (node.hv_type == null) {
                    if (node.preNodes.length == 0) {
                        node.layout.x = 0;
                    } else {
                        node.layout.x = d3.max(node.preNodes, node => (node.layout.x + node.layout.width + 10))
                    }
                }
            })

            // Deal with the overlapping
            orderedNodes.sort((a, b) => a.layout.y - b.layout.y);
            let isOverLap = function (a, b) {
                // detect overlap of two rectangles
                let minAX = a.layout.x, minAY = a.layout.y, minBX = b.layout.x, minBY = b.layout.y;
                let maxAX = minAX + a.layout.width, maxAY = minAY + a.layout.height,
                    maxBX = minBX + b.layout.width, maxBY = minBY + b.layout.height
                let aLeftOfB = maxAX < minBX;
                let aRightOfB = minAX > maxBX;
                let aAboveB = minAY > maxBY;
                let aBelowB = maxAY < minBY;
                return !(aLeftOfB || aRightOfB || aAboveB || aBelowB);
            }
            let detectOverlapCF = function (nodes) {
                for (let i = 0, ilen = nodes.length; i < ilen; i++) {
                    let node = nodes[i];
                    if (node.parent == null) continue
                    if (isOverLap(node, node.parent) == true) {
                        return node.parent.layout.y >= node.layout.y ? [node.parent, node] : [node, node.parent]
                    }
                }
                return false
            }

            let detectOverlapOP = function (nodes) {
                for (let i = 0, ilen = nodes.length; i < ilen; i++) {
                    for (let j = i + 1, jlen = nodes.length; j < jlen; j++) {
                        if (isOverLap(nodes[i], nodes[j]) == true) {
                            return nodes[i].layout.y >= nodes[j].layout.y ? [nodes[i], nodes[j]] : [nodes[j], nodes[i]]
                        }
                    }
                }
                return false
            }

            let index = 0;
            let loopSign = true;
            while (loopSign) {
                if (index > 100) {
                    console.log('out of 100 and return')
                    loopSign = false
                    break
                }
                let overlaps = detectOverlapCF(orderedNodes);
                if (overlaps == false) {
                    break
                } else {
                    let sign = false
                    orderedNodes.sort((a, b) => a.layout.y - b.layout.y);
                    for (let i = 0, ilen = orderedNodes.length; i < ilen; i++) {
                        let moveDown = 0;
                        if (overlaps[0] == orderedNodes[i]) {
                            sign = true;
                            moveDown = overlaps[0].layout.y - overlaps[1].layout.y
                        }
                        if (sign == true) {
                            orderedNodes[i].layout.y += (moveDown + offsetYGap)
                        }
                    }
                }
                index += 1;
            }

            index = 0;
            loopSign = true;
            while (loopSign) {
                if (index > 100) {
                    console.log('out of 100 and return')
                    loopSign = false;
                    break
                }
                let overlaps = detectOverlapOP(orderedNodes);
                if (overlaps == false) {
                    break
                } else {
                    let sign = false
                    orderedNodes.sort((a, b) => a.layout.y - b.layout.y);
                    for (let i = 0, ilen = orderedNodes.length; i < ilen; i++) {
                        let moveDown = 0;
                        if (overlaps[0] == orderedNodes[i]) {
                            sign = true;
                            moveDown = overlaps[0].layout.y - overlaps[1].layout.y
                        }
                        if (sign == true) {
                            orderedNodes[i].layout.y += (moveDown + offsetYGap)
                        }
                    }
                }
                index += 1;
            }
            // Process - steps-----------------------------------------------------------------------
            // Rendering
            let nodeColor = {
                'Map': 'red', 'Reducer': 'green', 'Other': 'grey'
            };
            console.log('node nodeColor', nodeColor)

            this.nodes = nodes;
        }
    },
    computed: {
        dagData() {
            return this.$store.state.dagData;
        },

    }
}
</script>

<style scoped>

</style>