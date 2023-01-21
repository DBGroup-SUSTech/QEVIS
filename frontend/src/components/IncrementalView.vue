<template>
    <el-row style="height: 100%; width: 100%">
        <svg style="height: 100%; width: 100%">
            <g v-if="loaded" class="progressContainer">
                <g class="nodeContainer">
                    <g v-for="vertex in vertexes" v-bind:key="vertex.vertex_name"
                       @mouseover="hoverVertex(vertex)"
                       @mouseout="hoverOutVertex(vertex)"
                       @click="drawDetailStructure(vertex)"
                       :transform="'translate(' +  [vertex.layout.x , vertex.layout.y] + ')'">

                        <rect class="progress" v-for="step in vertex.stepLayout" :key="step.id" :step="step" :x="step.x"
                              :width="step.width" :fill="step.fill" :height="vertex.layout.height" stroke-width="1" stroke-opacity="0">
                            <title>{{step.name}}</title>
                        </rect>
                        <rect :height="vertex.layout.height" fill="none"
                              :width="vertex.layout.width"
                              :stroke="'grey'" stroke-width="2"
                              :stroke-dasharray="strokedash[vertex.hvType]"
                        ></rect>
                        <text font-size="10px">{{ vertex.vertexName }}</text>
                    </g>
                </g>
                <g class="edgeContainer">
                    <IncrementalEdge v-for="edge in renderEdges" :edge="edge" :key="edge.idx"></IncrementalEdge>
                </g>
            </g>
            <g v-if="!loaded">
                <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
                    No data selected
                </text>
            </g>
            <g class="detailStructure"></g>
        </svg>
    </el-row>
</template>

<script>

import IncrementalEdge from "@/components/IncrementalEdge";
import * as d3 from "d3";
import {mapState} from "vuex";

export default {
    name: "IncrementalView",
    components: {
        IncrementalEdge
    },
    data() {
        return {
            containerWidth: 0,
            containerHeight: 0,
            strokedash:{
                'Map': '0',
                'Reducer':'4 2'
            }
        }
    },
    mounted() {
        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;
        this.containerHeight = height;
        this.containerWidth = width;
        this.detailStructure = d3.select(this.$el).select('svg').append('g')
            .attr('class', 'detailStructure');
        this.$store.commit('simulation/updateIncrementalScale', {'width': width, 'height': height});
    },
    watch: {
        loaded() {
            if (this.loaded == true) {
                this.svg = d3.select(this.$el).select('svg');
                var zoom = d3.zoom()
                    .scaleExtent([-3, 8])
                    .on('zoom', function () {
                        d3.select('.progressContainer').attr('transform', d3.event.transform);
                    });
                this.svg.call(zoom);
            }

        }
    },
    methods: {
        hoverVertex(vertex) {
            this.$store.commit('simulation/hoverVertex', vertex);
        },
        hoverOutVertex(vertex) {
            this.$store.commit('simulation/hoverOutVertex', vertex);
        },
        drawDetailStructure(vertex) {
            // todo: comments this for remove the extension
            // vertex.tasks.forEach(task=>{
            //     task.selectedToExtend = !task.selectedToExtend;
            // })


            this.$store.commit('simulation/updateSelectTimeScale', []);

            let node = vertex.dagNode;
            let infoContainerHeight = 30;
            let infoHeightGap = 20;

            // let detailStructureContainer = this.detailStructure
            let attrWidth = 200, attrUnitHeight = 20;
            let steps = node.vdat.step_list;
            let nodeWidth = 120, nodeHeight = 30, nodeConnections = [];
            let currentSumAttrHeight = 0;
            for (let i = 0, ilen = steps.length; i < ilen; i++) {
                steps[i].x = 0, steps[i].y = i * (infoContainerHeight + infoHeightGap);
                let keys = Object.keys(steps[i].attr_dict);
                let currentHeight = keys.length * attrUnitHeight;
                steps[i].attrX = 150;
                steps[i].width = nodeWidth;
                steps[i].height = nodeHeight;
                steps[i].attrY = currentSumAttrHeight;
                steps[i].attrHeight = currentHeight;
                steps[i].attrWidth = attrWidth;
                currentSumAttrHeight += (currentHeight + infoHeightGap);
                if (i == 0) continue;
                nodeConnections.push({'src': steps[i - 1], 'dst': steps[i]})
            }
            //todo:hard code
            console.log('click vertex ', vertex);
            let selectedTask = []
            vertex.tasks.forEach(task=>{
                selectedTask.push(task);
                    task.layout.selectedClick = !task.layout.selectedClick;
            })
            this.$store.commit('simulation/updateTaskView', selectedTask);




        }
    },
    computed: {
        vertexes() {
            return this.$store.state.simulation.vertexes;
        },
        renderEdges() {
            return this.$store.state.simulation.renderEdges;
        },
        loaded() {
            if (this.vertexes.length == 0 && this.renderEdges.length == 0) {
                return false
            } else {
                return true
            }
        },
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema,

        }),
    }
}
</script>

<style scoped>
.progress {
    opacity: 1
}

.progress:hover {
    opacity: 1;
}
</style>
