<template>
    <svg>
        <g :transform="containerTransform" class="matrixContainer">
            <!--Top view-->

            <g v-if="loaded">
                <g class="taskCount" :transform="countTransform">
                    <g v-if="selectionRegion.minStartTime>0">
                        <!--            <text :x="selectionRegion.x1">{{ parseInt(selectionRegion.startTime / 10 ** 9 * 1000) / 1000 }}</text>-->
                        <!--            <text :x="selectionRegion.x2" :y="size/8">{{ parseInt(selectionRegion.endTime / 10 ** 9 * 1000) / 1000 }}</text>-->
                        <text fill-opacity="0.8" font-size="10" :x="(selectionRegion.x1 + selectionRegion.x2)/2 "
                              :y="size/8 - 5">
                            {{ (selectionRegion.endTime - selectionRegion.startTime) / 1000 + 's' }}
                        </text>
                    </g>
                    <rect fill="none" stroke="grey" fill-opacity="0.2"
                          :width="size" :height="countHeight" stroke-width="0.5"></rect>
                    <path :d="taskCount" stroke="darkgrey" fill="grey" fill-opacity="0.1"></path>
                    <!--          <path :d="selectTaskCount" stroke="purple" fill="purple" fill-opacity="0.1"></path>-->
                </g>
                <g class="matrix" :transform="matrixTransform">
                    <rect fill="none" stroke="grey" fill-opacity="0.2"
                          :width="size" :height="size" stroke-width="0.5"></rect>


                    <rect class="upperRegion" stroke="grey" :width="size" stroke-width="0.5"
                          :height="upperHeight" fill="grey" fill-opacity="0.05"></rect>
                    <rect class="lowerRegion" stroke="grey" :width="size" stroke-width="0.5"
                          :y="size-upperHeight" :height="upperHeight" fill="grey" fill-opacity="0.05"></rect>


                    <TaskNode v-for="task in taskList"
                              :key="task.task_id" :xScale="xScale" :yScale="yScale"

                              v-show="!task.selectedToExtend"
                              :task="task" :matrixDiagMin="matrixDiagMin" :matrixDiagMax="matrixDiagMax"/>
                    <line style="stroke:grey;stroke-width:0.5" stroke-dasharray="4"
                          :x1="0"
                          :y1="0"
                          :x2="upperRight"
                          :y2="upperHeight">
                    </line>
                    <line style="stroke:grey;stroke-width:0.5" stroke-dasharray="4"
                          :x1="lowerLeft"
                          :y1="size-upperHeight"
                          :x2="size"
                          :y2="size">
                    </line>
                    <line style="stroke:grey;stroke-width:0.5" stroke-dasharray="4"
                          v-if="upperHeight==0"
                          :x1="0"
                          :y1="0"
                          :x2="size"
                          :y2="size">
                    </line>
                    <!--lowerLeft-->

                    <!--                    <g :transform="memoryTransform">-->
                    <!--                        <rect :width="size" :height="countHeight"-->
                    <!--                              fill="white"-->
                    <!--                              stroke-width="0.5" stroke="grey"></rect>-->
                    <!--                        <path stroke="none" fill="grey" fill-opacity="0.1"-->
                    <!--                              :d="memArea"></path>-->
                    <!--                        <path stroke="grey" fill="none" fill-opacity="0.1"-->
                    <!--                              :d="memLine"></path>-->
                    <!--                    </g>-->
                    <g :transform="cpuTransform">
                        <rect :width="size" :height="countHeight"
                              fill="white"
                              stroke-width="0.5" stroke="grey"></rect>
                        <path v-for="c in cpuPaths" :key="c.id" :d="c.line" stroke="black" fill="none"
                              stroke-opacity='0.3' stroke-width="0.5"></path>
                    </g>
                    <!--                    <g :transform="netTransform">-->
                    <!--                        <rect :width="size" :height="countHeight"-->
                    <!--                              fill="white"-->
                    <!--                              stroke-width="0.5" stroke="grey"></rect>-->
                    <!--                        <path v-for="c in netIOLines" :key="c.id" :d="c.line" stroke="black" fill="none"-->
                    <!--                              stroke-opacity='0.3' stroke-width="0.5"></path>-->
                    <!--                    </g>-->
                    <!--                    <g :transform="diskTransform">-->
                    <!--                        <rect :width="size" :height="countHeight"-->
                    <!--                              fill="white"-->
                    <!--                              stroke-width="0.5" stroke="grey"></rect>-->
                    <!--                        <path v-for="c in diskPaths" :key="c.id" :d="c.line" stroke="black" fill="none"-->
                    <!--                              stroke-opacity='0.3' stroke-width="0.5"></path>-->
                    <!--                    </g>-->
                    <g v-if="timeSelected == true">
                        <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"
                              :x1="timeSelectRegion.x1"
                              :y1="0"
                              :x2="timeSelectRegion.x1"
                              :y2="size">
                        </line>
                        <line style="stroke:mediumpurple; stroke-width:1" stroke-dasharray="4"
                              :x1="timeSelectRegion.x2"
                              :y1="0"
                              :x2="timeSelectRegion.x2"
                              :y2="size">
                        </line>

                        <line style="stroke:mediumpurple;stroke-width:1" stroke-dasharray="4"
                              :x1="0"
                              :y1="timeSelectRegion.y1"
                              :x2="size"
                              :y2="timeSelectRegion.y1">
                        </line>

                        <line style="stroke:mediumpurple;stroke-width:1" stroke-dasharray="4"
                              :x1="0"
                              :y1="timeSelectRegion.y2"
                              :x2="size"
                              :y2="timeSelectRegion.y2">
                        </line>
                    </g>
                    <g class="vertexNode">
                        <!--            <VertexNode v-for="vertex in vertexes" :key="vertex.idx"-->
                        <!--                        :vertex="vertex"></VertexNode>-->
                    </g>
                </g>
                <g class="extendTaskList" >
                    <TaskNodeExtend v-for="(task, index) in extendTaskList" :key="task.task_id"
                                    :xScale="xScale" :task="task"
                                    :y="index*extendBarHeight"  :x="xScale(task.start_time)"
                                    :width="xScale(task.end_time) - xScale(task.start_time)"
                    ></TaskNodeExtend>
                    <!--                    <rect v-for="(task, index) in extendTaskList" :key="task.task_id+id"-->
                    <!--                          :x="xScale(task.start_time)"-->
                    <!--                          :y="index*5"-->
                    <!--                          :width="task.extendLayuout.width"-->
                    <!--                          stroke-width="2"-->
                    <!--                          stroke="blue"-->
                    <!--                          fill="none"-->
                    <!--                          height="5"-->
                    <!--                    ></rect>-->

                    <!--                    <TaskNode v-for="task in taskList" :key="task.task_id" :xScale="xScale"-->
                    <!--                              :task="task" :matrixDiagMin="matrixDiagMin" :matrixDiagMax="matrixDiagMax"/>-->
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
import TaskNodeExtend from "@/components/ScatterView/TaskNodeExtend";
import * as d3 from "d3";
// import TweenLite from "gsap";
// import VertexNode from "@/components/ScatterView/VertexNode";

const dLine = d3.line().x(d => d.x).y(d => d.y);

const atomTaskCountLine = function (taskList, outputRange, mXScale) {
    let usage = [];
    let trend = [];
    let count = 0;
    taskList.forEach(task => {
        usage.push({'type': 'start', 'time': task.start_time});
        usage.push({'type': 'end', 'time': task.end_time});
    })
    usage.sort((a, b) => (a.time > b.time) ? 1 : -1);

    usage.forEach(u => {
        if (u.type == 'start') {
            count += 1;
        } else if (u.type == 'end') {
            count -= 1;
        } else {
            console.log('error type')
        }
        if (trend.length > 0 && trend[trend.length - 1].time == u.time) {
            trend[trend.length - 1].count = count;
        } else {
            if (trend.length == 0) {
                trend.push({'time': u.time, 'count': 0})
            }
            trend.push({'time': u.time, 'count': count})
        }
    })

    let mTYScale = d3.scaleLinear().domain([0, d3.max(trend, u => u.count)]).range(outputRange);
    let _render = [];
    trend.forEach((u, i) => {
        if (i != 0) {
            _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
        }
        _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
    })
    return dLine(_render);
}
export default {
    name: "Task",
    props: ['taskList', 'id', 'ch', 'status'],
    data() {
        let ch = 30
        if (this.ch != undefined) {
            ch = this.ch
        }
        return {
            gap: 3,
            size: 0,
            containerHeight: 0,
            containerWidth: 0,
            countHeight: ch,
            timeSelectRegion: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 0
            },
            xScale: undefined,
            selectTaskCount: "",
            taskCount: "",
            nOInter: 0,
            expandRate: 3,
            yScale: undefined,
            yUScale: undefined,
            yLScale: undefined,
            memLine: "",
            memArea: "",
            cpuPaths: [],
            netIOLines: [],
            diskPaths: [],
            // Extend data
            extendTaskList: [],
            extendBarHeight: 5,
            extendRegionHeight: 0,
            extendRegionY: 0,
            extendTimeBoundary: 0,

            upperHeight:0,
            upperRight: 0,

            lowerLeft:0,

        }
    },

    components: {
        TaskNode,
        TaskNodeExtend
        // VertexNode
    },
    mounted() {
        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        let size = Math.min(this.$el.clientWidth, this.$el.clientHeight) - (2 * this.gap);
        this.size = size;
        // this.countHeight = this.size - this.gap;
        this.$store.commit('simulation/updateTaskScale', {
            'width': this.size,
            'height': this.size,
            'size': this.size,
            'upperHeight': this.countHeight,
        })

        // this.yScale = d3.scaleLinear().domain([0, 100]).range([this.countHeight, 5]);


    },
    watch: {
        renderSign() {
            console.log('renderSign');
            if (this.xScale == undefined) {
                this.xScale = d3.scaleLinear().domain([this.minTime, this.maxTime]).range([0, this.size - 20]);
            }
            if (this.xScale != undefined) {
                this.xScale = d3.scaleLinear().domain([this.minTime, this.vMaxTime]).range([0, this.size - 20]);
            }
            this.taskCount = atomTaskCountLine(this.taskList, [this.countHeight, 0], this.xScale);
            let tasks = [];
            this.taskList.forEach((task, index) => {
                //TODO will be removed!
                if (task.selectedToExtend == true) {
                    task.extendLayuout = {
                        "x": this.xScale(task.start_time),
                        "y": index * 5,
                        "width": this.xScale(task.end_time) - this.xScale(task.start_time)
                    };
                    tasks.push(task);
                }
            })

            if(tasks.length == 0){
                this.yScale = this.xScale;
                this.upperHeight = 0;
                this.lowerLeft = 0;

            }else{

                this.extendTimeBoundary = tasks.length > 0? tasks[0].start_time: this.minTime;
                let _ebx = this.extendTimeBoundary;
                this.extendRegionHeight = tasks.length * this.extendBarHeight;
                this.extendRegionY = (this.size - this.extendRegionHeight) / 2;
                this.extendTaskList = tasks;

                this.upperHeight = this.extendRegionY;
                this.upperRight = this.xScale(this.extendTimeBoundary);
                this.lowerLeft = this.upperRight;

                let yUScale = d3.scaleLinear().domain([this.minTime, this.extendTimeBoundary]).range([0, this.extendRegionY]);
                let yLScale = d3.scaleLinear().domain([this.extendTimeBoundary, this.maxTime])
                    .range([this.extendRegionY + this.extendRegionHeight, this.size - 20]);
                this.yScale = function(timeStamp){

                    if(timeStamp < _ebx){
                        return yUScale(timeStamp);
                    }else{
                        return yLScale(timeStamp);
                    }

                }
            }


            // this.yScale = function(timeStamp){
            //     if(timeStamp < _ebx){
            //         return yUScale(timeStamp);
            //     }else{
            //         return yLScale(timeStamp);
            //     }
            //
            // }



            // this.yScale = function(){
            //     let upperScale = d3.scaleLinear().domain([0, 100]).range([this.countHeight, 5]);
            //     return upperScale
            // }
            d3.select(this.$el).select('.extendTaskList').attr('transform', 'translate(' + [0, this.extendRegionY] + ')')
            // const memLine = d3.line().x(d => this.xScale(d.timestamp)).y(d => this.yScale(d.value));
            // console.log('sere', memLine(memoryUsage))

        },
        loaded() {
            if (this.loaded == true) {
                console.log('matrix data loaded');
                this.svg = d3.select(this.$el).select('svg');
                var zoom = d3.zoom()
                    .scaleExtent([-3, 8])
                    .on('zoom', function () {
                        d3.select('.matrix').attr('transform', d3.event.transform);
                    });
                this.svg.call(zoom);
            }

        },
        selectionRegion: {
            handler(timeSelection) {
                if (this.xScale) {
                    this.timeSelectRegion.x1 = this.xScale(timeSelection.minStartTime);
                    this.timeSelectRegion.x2 = this.xScale(timeSelection.maxEndTime);
                    this.timeSelectRegion.y1 = this.xScale(timeSelection.minStartTime);
                    this.timeSelectRegion.y2 = this.xScale(timeSelection.maxStartTime);
                }
            },
            deep: true
        }
    },
    computed: {

        containerTransform() {
            let dx = this.gap, dy = this.gap;
            if (this.containerWidth > this.containerHeight) {
                dx += (this.containerWidth - this.size) / 2;
            } else {
                dy += 0;
            }
            return 'translate(' + [dx, dy] + ')';
        },
        matrixTransform() {
            return 'translate(' + [0, 0] + ')';
        },
        countTransform() {
            return 'translate(' + [0, this.size] + ')';
        },
        memoryTransform() {
            return 'translate(' + [0, this.size + this.countHeight] + ')';
        },
        cpuTransform() {
            return 'translate(' + [0, this.size + this.countHeight * 2] + ')';
        },
        netTransform() {
            return 'translate(' + [0, this.size + this.countHeight * 3] + ')';
        },
        diskTransform() {
            return 'translate(' + [0, this.size + this.countHeight * 4] + ')';
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
            matrixDiagMin: state => state.matrixDiagMin,
            matrixDiagMax: state => state.matrixDiagMax,
            selectionRegion: state => state.timeSelection,
            renderSign: state => state.renderSign,
            maxTime: state => state.maxTime,
            minTime: state => state.minTime,
            vMaxTime: state => state.vMaxTime,
            metrics: state => state.metrics
        }),
        loaded() {
            if (this.taskList.length == 0) {
                return false
            } else {
                return true
            }
        },
        timeSelected() {
            let _sum = this.selectionRegion.startTime + this.selectionRegion.endTime;

            if (_sum > 0) {
                return true;
            } else {
                return false;
            }
        },
    }
}
</script>

<style scoped>

</style>
