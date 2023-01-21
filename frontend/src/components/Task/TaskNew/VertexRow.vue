<template>
    <g :transform="rowTransform" v-if="renderComponent">
        <rect style="rx:1; ry:1" :width="width" :height="this.data.config.unitHeight - 2 * marginY" :fill="headConfig.contextFill" :y="marginY"
              :stroke-width="headConfig.strokeWidth"
              fill-opacity="0.2" stroke="grey"></rect>
        <text class="name" x='18' :y="textMarginY" style="font-size: 10px">{{this.data.key.split(' ')[0][0] +this.data.key.split(' ')[1]}}</text>
        <path v-if="data.extend!==undefined" :d="generateTriangle" :fill="'#3e3e3e'" stroke="white" @click="clickExtend"></path>
        <!--        <g v-if="data.extend !== true">-->
        <g>
            <g :transform="'translate(' + [headLength, 0] + ')'">
                <PercBar :height="data.config.unitHeight" :width="cellWidth" :barHeight="machineSize" :marginLR="10"
                         :maxVal="machineNames.length" :val="data.values.length"
                         :showMax="true"
                ></PercBar>
            </g>
            <g :transform="'translate(' + [taskCountX, 0] + ')'">
                <PercBar :height="data.config.unitHeight" :width="cellWidth" :barHeight="machineSize" :marginLR="10"
                         :maxVal="taskNum" :val="extractTasks().length"
                         :showMax="false"
                ></PercBar>
            </g>
            <g :transform="'translate(' + [taskDurationX, 0] + ')'">
                <DurationBar v-if="contextType=='Duration'" :height="data.config.unitHeight" :width="taskLength" :strokeColor="strokeColor"
                             :start="vertexStart" :end="vertexEnd" :barHeight="machineSize" :timeScale="timeScale"
                ></DurationBar>

                <DensityBar v-else-if="contextType === 'TimeUsage'"
                            :tScale="tScale"
                            :dataList="timeUsageList"
                            :height="data.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
                ></DensityBar>

            </g>
        </g>
        <!--        <g v-if="data.extend === true">-->
        <g v-if="false">
            <g class="statistics" :transform="'translate(' + [headLength, this.data.config.unitHeight] + ')'">
                <VertexView v-if="vertexEnd != 0" :width="width-headLength" :height="this.detailHeight"
                            :vertexStart="vertexStart" :vertexEnd="vertexEnd" :maxDuration="maxDuration"
                            :tasks="extractTasks()"
                            :headConfig="headConfig">
                </VertexView>
            </g>
        </g>
        <g v-if="data.extend === true">
            <line :x1="3 + 6" :x2="3 + 6"
                  :y1="data.config.unitHeight + data.config.unitHeight / 2 + 6"
                  :y2="data.config.height - data.config.unitHeight / 2 - 6"
                  stroke="grey" stroke-width="0.3"
            ></line>
            <circle :cx=" 3 +6" :cy="data.config.unitHeight + data.config.unitHeight / 2" r="3" fill="grey"></circle>
            <circle :cx=" 3 +6" :cy="data.config.height - data.config.unitHeight / 2" r="3" fill="grey"></circle>
        </g>
        <g v-if="subvalues !== undefined && data.extend === true"
           :transform="'translate(' + [0, this.data.config.unitHeight] + ')'">
            <g v-for="(subData, index) in subvalues" :key="subData.key" :transform="'translate(' + [headLength, 0] + ')'">
                <MachineRow :widthRatio="widthRatio" :data="subData" :width="width - headLength" :columns="columns"
                            :cellWidth="cellWidth" :timeScale="timeScale"
                            :start="start" :end="end"
                            :machineSize="machineSize"
                            :maxDuration="maxDuration"
                            :headConfig="headConfig"
                            :strokeColor="strokeColor"
                            :taskCount="taskLength"
                            :headLength="headLength"
                            :taskNum="taskNum"
                            :textMarginY="textMarginY"
                            :taskCountLength="taskCountLength"
                            :index="index" :brothers="subvalues" :height="height"
                            :srcNestMap="srcNestMap"
                            :dstNestMap="dstNestMap"
                            :counters="counters"
                            :contextType="contextType"
                            :tScale="tScale"
                ></MachineRow>
            </g>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"
import MachineRow from "@/components/Task/TaskNew/MachineRow";
import VertexView from "@/components/Task/TaskNew/VertexView";
import PercBar from "@/components/Task/TaskNew/subcomponents/PercBar";
import DurationBar from "@/components/Task/TaskNew/subcomponents/DurationBar";
import DensityBar from "@/components/Task/TaskNew/subcomponents/DensityBar";
// import Row from "./Row"


export default {
    name: "Row",
    props: ['widthRatio', 'data', 'width', 'columns', 'index', 'brothers', 'timeScale',
        'start', 'end', 'machineNames', 'maxDuration', 'headConfig', 'taskNum', "counters",
        'srcNestMap', 'dstNestMap', 'contextType'],
    data() {
        return {
            cellWidth: 0,
            machineSize: 15,
            machineColor: {
                'dbg18': 'red',
                'dbg19': 'blue',
                'dbg20': 'green'
            },
            vertexStart: 0,
            vertexEnd: 0,
            headLength: 40,
            detailHeight: 100,
            marginY: 3,
            textMarginY: 19,
            taskLength: 0,
            // task count
            taskCountX: 0,
            // task duration
            taskDurationX: 0,
            taskCountLength: 0,
            strokeColor: 'grey',
            timeUsageList: [],
            tScale: undefined,
            renderComponent: true
        }
    },
    components:{
        VertexView,
        MachineRow,
        PercBar,
        DurationBar,
        DensityBar},
    mounted(){

        // machine part
        this.cellWidth = (this.width - this.headLength) / 5
        this.taskCountLength = (this.width - this.headLength) / 5
        // task part
        this.taskCountX = this.headLength + this.cellWidth
        // task count
        // task duration
        this.taskDurationX = this.headLength + this.cellWidth + this.taskCountLength
        this.taskLength = this.width - this.taskDurationX
        this.timeScale.range([0, this.taskLength]);
        this.vertexStart = d3.min(this.data.values, machine=>d3.min(machine.taskList, task=>task.start_time))
        this.vertexEnd = d3.max(this.data.values, machine=>d3.max(machine.taskList, task=>task.end_time))

        const offsetY = (this.data.config.unitHeight + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
        this.textMarginY = offsetY

        this.machineSize = this.data.config.unitHeight - this.marginY * 2 - 4 * 2
        this.data.values.forEach(machine=>{
            machine.values.forEach(task=>[
                this.timeUsageList.push(task.end_time - task.start_time)
            ])
        })
        this.tScale = d3.scaleLinear().domain(d3.extent(this.timeUsageList)).range([0, this.taskLength])

    },
    methods: {
        sum(arr) {
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
        forceRerender(){
            console.log('forec render in vertex', this.data)
            // Remove my-component from the DOM
            this.renderComponent = false;

            this.$nextTick(() => {
                // Add the component back in
                this.renderComponent = true;
            });
        },
        extractTasks(){
            let tasks = []
            this.data.values.forEach(machine=>{
                tasks = tasks.concat(machine.values)
            })
            return tasks
        },
        clickExtend(){
            this.data.extend = !this.data.extend
            if(this.data.extend && this.data.values != undefined){
                // this.data.config.height = d3.sum(this.data.values, d=>d.config.height) + this.detailHeight + this.data.config.unitHeight
                this.data.config.height = d3.sum(this.data.values, d=>d.config.height) + this.data.config.unitHeight
            }else {
                this.data.config.height = + this.data.config.unitHeight
            }

            this.forceRerender()
        },
        clickDetails(){
            this.data.detail = !this.data.detail
            if(this.data.extend && this.data.values != undefined){
                this.data.config.height = d3.sum(this.data.values, d=>d.config.height) + this.data.config.unitHeight
            }else {
                this.data.config.height = this.data.config.unitHeight
            }
        }
    },
    watch: {
        totalHeight(){
            console.log('total height changed', this.data.config.height)
            this.data.config.height = this.totalHeight + this.data.config.unitHeight
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
            return this.data.config.height
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
        subvalues(){
            return this.data.values
        },
        totalHeight(){
            if(this.data.values){
                return d3.sum(this.data.values, d=>d.config.height)
            }else{
                return this.data.config.height
            }
        }
        // gTransform(){
        //     return 'translate(' + [this.sum(this.currentRatio.slice(0, this.i)) * this.width, 0] + ')'
        // }
    }
}
</script>

<style scoped>

</style>