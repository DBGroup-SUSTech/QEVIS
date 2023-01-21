<template>
    <g :transform="rowTransform">
        <rect style="rx:3; ry:3" :width="width" :height="height"
              :fill="headConfig.contextFill" :y="marginY"
              :stroke-width="headConfig.strokeWidth"
              fill-opacity="0.3" stroke="grey"></rect>
        <text class="name" x='20' :y="textMarginY" style="font-size: 10px">{{data.key}}</text>
        <path v-if="data.extend!==undefined" :d="generateTriangle"
              :fill="'#3e3e3e'" stroke="white" @click="clickExtend"></path>
        <g :transform="'translate(' + [taskCountX, 0] + ')'">
            <PercBar :height="data.config.unitHeight" :width="cellWidth" :barHeight="machineSize" :marginLR="10"
                     :maxVal="taskNum" :val="data.taskList.length"
                     :showMax="false"
            ></PercBar>
        </g>
        <g :transform="'translate(' + [taskDurationX, 0] + ')'">
            <DurationBar v-if="contextType == 'Duration'"
                         :height="data.config.unitHeight" :width="taskLength" :strokeColor="strokeColor"
                         :start="taskStart" :end="taskEnd" :barHeight="machineSize" :timeScale="timeScale"
            ></DurationBar>
            <DensityBar v-else-if="contextType === 'TimeUsage' && dataSummary !== undefined"
                        :tScale="tScale"
                        :dataList="dataSummary['TimeUsageList']"
                        :height="data.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
            ></DensityBar>
        </g>
        <g v-if="data.extend === true">
            <line :x1="3 + 6" :x2="3 + 6"
                  :y1="data.config.unitHeight + data.config.unitHeight / 2"
                  :y2="data.config.height - data.config.unitHeight / 2"
                  stroke="grey" stroke-width="0.3"
            ></line>
            <circle :cx=" 3 +6" :cy="data.config.unitHeight + data.config.unitHeight / 2" r="3" fill="grey"></circle>
            <circle :cx=" 3 +6" :cy="data.config.height - data.config.unitHeight / 2" r="3" fill="grey"></circle>
        </g>

        <g v-if="values !== undefined && data.extend === true" :transform="'translate(' + [0, data.config.unitHeight] + ')'">
            <g class="taskContainer" :id="task.task_id" v-for="(task, index) in values" :key="task.task_id" :transform="'translate(' + [headLength, 0] + ')'">
                <TaskRow :data="task" :brothers="values" :index="index"
                         :width="width - headLength"
                         :marginY="marginY"
                         :textMarginY="textMarginY"
                         :headConfig="headConfig"
                         :durationLength = "taskLength"
                         :timeScale="timeScale"
                         :strokeColor="strokeColor"
                         :machineSize="machineSize"
                         :srcNestMap="srcNestMap"
                         :dstNestMap="dstNestMap"
                         :dataInfo="counters[task.task_id]"
                         :dataSummary="dataSummary"
                         :contextType="contextType"
                         :tScale="tScale"
                ></TaskRow>
            </g>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"
import TaskRow from "@/components/Task/TaskNew/TaskRow";
import PercBar from "@/components/Task/TaskNew/subcomponents/PercBar";
import DurationBar from "@/components/Task/TaskNew/subcomponents/DurationBar";
import DensityBar from "@/components/Task/TaskNew/subcomponents/DensityBar";
// import Row from "./Row"
export default {
    name: "Row",
    props: ['widthRatio', 'data', 'width', 'columns', 'headLength', 'taskCountLength',
        'index', 'brothers', 'cellWidth', 'timeScale', 'taskNum',
        'maxDuration', 'headConfig', 'strokeColor', 'textMarginY', 'counters',
        'srcNestMap', 'dstNestMap', 'contextType', 'tScale'
    ],
    components:{ TaskRow, PercBar, DurationBar, DensityBar },
    data(){
        return {
            taskStart: 0,
            taskEnd: 0,
            marginY: 2,
            machineSize: 0,
            taskDurationX: 0,
            taskLength: 0,
            taskCountX: 0,
            dataSummary: undefined,

        }
    },
    mounted(){
        // this.taskDurationX = this.headLength + this.cellWidth + this.taskCountLength
        this.taskStart = d3.min(this.values, task=>task.start_time)
        this.taskEnd = d3.max(this.values, task=>task.end_time)
        this.machineSize = this.data.config.unitHeight - this.marginY * 2 - 4 * 2
        const offsetY = (this.data.config.unitHeight + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
        d3.select(this.$el).select('.name').attr('y', offsetY)

        this.taskCountX = this.cellWidth
        this.taskDurationX = this.cellWidth + this.taskCountLength
        this.taskLength = this.width - this.taskDurationX
        // this.subvalues = this.data.values

        let keys = Object.keys(Object.values(this.counters)[0])
        this.dataSummary = {}
        keys.forEach(key=>{
            this.dataSummary[key] = d3.extent(this.values, task => this.counters[task.task_id][key])
        })
        this.dataSummary['TimeUsageList'] = this.values.map(task=>task.end_time - task.start_time)

        console.log('tscale', this.tScale.domain(), this.tScale.range())

    },
    methods: {
        click() {
        },
        sum(arr) {
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
        clickExtend(){
            this.data.extend = !this.data.extend
            if(this.data.extend && this.data.taskList != undefined){
                this.data.config.height = d3.sum(this.data.taskList, d=>d.config.height) + this.data.config.unitHeight
            }else {
                this.data.config.height = this.data.config.unitHeight
            }
            console.log('click', this.data.extend)
        }
    },
    watch: {
        totalHeight(){
            this.data.config.height = this.totalHeight + this.data.config.unitHeight
        },
        height() {
            console.log('heigth changed vertex', this.height)
        },
        counters(){
            if(this.counters !== undefined){
                console.log('data summary', this.dataSummary)
            }

        }
    },
    computed: {
        generateTriangle(){
            let length = 12
            let width = 10
            const l1 = 5
            const t1 = (this.data.config.unitHeight - length) / 2
            const l2 = l1 - 2
            const t2 = (this.data.config.unitHeight - width) / 2
            if(!this.data.extend) {
                const array = [[l1, t1], [l1 + width, t1 + length / 2], [l1 , t1 + length]]
                let line = d3.line().x(d=>d[0]).y(d=>d[1])
                return line(array)
            }else{
                const array = [[l2, t2], [l2 + length, t2], [l2 + length / 2, t2 + width]]
                let line = d3.line().x(d=>d[0]).y(d=>d[1])
                return line(array)
            }
        },
        height(){
            return this.data.config.unitHeight - 2 * this.marginY
        },
        currentRatio() {
            return  this.widthRatio
        },
        rowTransform() {
            const x = 0
            return 'translate(' + [x, this.y]+ ')'
        },
        y(){
            let y = 0
            for(let i = 0, ilen = this.index; i < ilen; i++){
                y += this.brothers[i].config.height
            }
            return y
        },
        currentColumns() {
            return this.columns
        },
        values(){
            return this.data.taskList
        },
        totalHeight(){
            if(this.data.taskList){
                return d3.sum(this.data.taskList, d=>d.config.height)
            }else{
                return this.data.config.height
            }
        }
    }
}
</script>

<style scoped>

</style>