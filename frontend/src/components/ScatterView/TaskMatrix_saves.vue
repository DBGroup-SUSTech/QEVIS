<template>
    <svg>
        <g :transform="containerTransform" class="matrixContainer">
            <!--Top view-->
            <g v-if="loaded">
                <g class="taskCount" :transform="countTransform">
                    <g v-if="selectionRegion.startTime>0">
                        <!--            <text :x="selectionRegion.x1">{{ parseInt(selectionRegion.startTime / 10 ** 9 * 1000) / 1000 }}</text>-->
                        <!--            <text :x="selectionRegion.x2" :y="size/8">{{ parseInt(selectionRegion.endTime / 10 ** 9 * 1000) / 1000 }}</text>-->
                        <text fill-opacity="0.8" font-size="10" :x="(selectionRegion.x1 + selectionRegion.x2)/2 "
                              :y="size/8 - 5">
                            {{ (selectionRegion.endTime - selectionRegion.startTime) / 1000 + 's' }}
                        </text>
                    </g>
                    <rect fill="none" stroke="grey" fill-opacity="0.2"
                          :width="size*3/4" :height="size*1/8" stroke-width="0.5"></rect>
                    <path :d="taskCount" stroke="darkgrey" fill="grey" fill-opacity="0.1"></path>
                    <path :d="selectTaskCount" stroke="purple" fill="purple" fill-opacity="0.1"></path>
                </g>
                <g class="leftContainer" :transform="leftTransform">
                    <rect fill="none" stroke="grey" fill-opacity="0.2"
                          :height="size*3/4" :width="size*1/8" stroke-width="0.5"></rect>
                </g>
                <g class="bottomContainer" :transform="bottomTransform">
                    <rect fill="none" stroke="grey" fill-opacity="0.2"
                          :width="size*3/4" :height="size*1/8" stroke-width="0.5"></rect>
                </g>
                <g class="rightContainer" :transform="rightTransform">
                    <rect fill="none" stroke="grey" fill-opacity="0.2"
                          :height="size*3/4" :width="size*1/8" stroke-width="0.5"></rect>
                </g>
                <g class="matrix" :transform="matrixTransform">
                    <TaskNode v-for="task in taskList" :key="task.task_id"
                              :task="task" :matrixDiagMin="matrixDiagMin" :matrixDiagMax="matrixDiagMax"/>
                    <line style="stroke:grey;stroke-width:0.5" stroke-dasharray="4"
                          :x1="matrixDiagMin.x"
                          :y1="matrixDiagMin.y"
                          :x2="matrixDiagMax.x"
                          :y2="matrixDiagMax.y">
                    </line>
                    <g v-if="timeSelected == true">
                        <line style="stroke:mediumpurple; stroke-width:1" stroke-dasharray="4"
                              :x1="selectionRegion.x1"
                              :y1="-size / 8"
                              :x2="selectionRegion.x1"
                              :y2="matrixDiagMax.y + size / 8">
                        </line>
                        <line style="stroke:mediumpurple; stroke-width:1" stroke-dasharray="4"
                              :x1="selectionRegion.x2"
                              :y1="-size / 8"
                              :x2="selectionRegion.x2"
                              :y2="matrixDiagMax.y + size / 8">
                        </line>

                        <line style="stroke:mediumpurple;stroke-width:1" stroke-dasharray="4"
                              :x1="-size / 8"
                              :y1="selectionRegion.y1"
                              :x2="matrixDiagMax.x + size / 8"
                              :y2="selectionRegion.y1">
                        </line>

                        <line style="stroke:mediumpurple;stroke-width:1" stroke-dasharray="4"
                              :x1="-size / 8"
                              :y1="selectionRegion.y2"
                              :x2="matrixDiagMax.x + size / 8"
                              :y2="selectionRegion.y2">
                        </line>
                    </g>
                    <g class="vertexNode">
                        <!--            <VertexNode v-for="vertex in vertexes" :key="vertex.idx"-->
                        <!--                        :vertex="vertex"></VertexNode>-->
                    </g>
                </g>
            </g>
            <g v-if="!loaded">
                <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
                    No data selected
                </text>
            </g>
        </g>


    </svg>
</template>

<script>
import {mapState} from "vuex";
import TaskNode from "@/components/ScatterView/TaskNode";
// import VertexNode from "@/components/ScatterView/VertexNode";


export default {
    name: "Task",

    data() {
        return {
            'gap': 10,
            'size': 10,
            containerHeight: 0,
            containerWidth: 0
        }
    },
    components: {
        TaskNode,
        // VertexNode
    },
    mounted() {
        let gap = 10;

        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        let size = Math.min(this.$el.clientWidth, this.$el.clientHeight) - (2 * gap);
        this.$store.commit('simulation/updateTaskScale', {
            'width': size / 4 * 3,
            'height': size / 4 * 3,
            'size': size,
            'upperHeight': size / 8,
        })
        this.size = size;

    },
    watch: {},
    computed: {
        containerTransform() {
            let dx = this.gap, dy = this.gap;
            if (this.containerWidth > this.containerHeight) {
                dx += (this.containerWidth - this.size) / 2;
            } else {
                dy += (this.containerHeight - this.size) / 2;
            }
            return 'translate(' + [dx, dy] + ')';
        },
        matrixTransform() {
            return 'translate(' + [this.size / 8, this.size / 8] + ')';
        },
        countTransform() {
            return 'translate(' + [this.size / 8, 0] + ')';
        },
        leftTransform() {
            return 'translate(' + [0, this.size / 8] + ')';
        },
        bottomTransform() {
            return 'translate(' + [this.size / 8, this.size - (this.size / 8)] + ')';
        },
        rightTransform() {
            return 'translate(' + [this.size - (this.size / 8), this.size / 8] + ')';
        },
        ...mapState('simulation', {
            taskList: state => state.taskList,
            vertexes: state => state.vertexes,
            matrixDiagMin: state => state.matrixDiagMin,
            matrixDiagMax: state => state.matrixDiagMax,
            taskCount: state => state.taskCount,
            selectTaskCount: state => state.selectTaskCount,
            selectionRegion: state => state.timeSelection
        }),
        // containerTransform() {
        //   return "translate(" + [this.gap, this.gap] + ')';
        // },
        loaded() {
            if (this.vertexes.length == 0 && this.taskList.length == 0) {
                return false
            } else {
                return true
            }
        },
        timeSelected() {
            let _sum = this.selectionRegion.x1 + this.selectionRegion.x2 + this.selectionRegion.y1 + this.selectionRegion.y2;
            if (_sum == 0) {
                return false;
            } else {
                return true;
            }
        }

    }
}
</script>

<style scoped>

</style>