<template>
    <g :transform="rowTransform">
        <rect style="rx:3; ry:3" :width="width" :height="height"
              :fill="headConfig.contextFill" :y="marginY"
              :stroke-width="strokeWidth"
              fill-opacity="0.3" :stroke="currentStroke"></rect>
        <text class="name" x='20' :y="textMarginY" style="font-size: 10px; user-select: none;">{{machine.machineName}}</text>
        <path v-if="machine.extend!==undefined" :d="generateTriangle"
              style="cursor: pointer"
              :fill="'#3e3e3e'" stroke="white" @click="clickExtend"></path>
        <g :transform="'translate(' + [cellWidth, 0] + ')'">
            <PercBar :height="machine.config.unitHeight" :width="cellWidth" :barHeight="machineSize" :marginLR="10"
                     :maxVal="taskNum" :val="machine.taskTreeModelList.length"
                     :showMax="false"
            ></PercBar>
        </g>
        <g :transform="'translate(' + [taskDurationX, 0] + ')'">
            <DurationBar v-if="contextType === 'Duration'"
                         :height="machine.config.unitHeight" :width="taskLength" :strokeColor="strokeColor"
                         :start="taskStart" :end="taskEnd" :barHeight="machineSize" :timeScale="timeScale"
            ></DurationBar>
            <DensityBar v-else-if="contextType === 'TimeUsage' && dataSummary !== undefined"
                        :tScale="tScale"
                        :dataList="dataSummary['TimeUsageList']"
                        :height="machine.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
            ></DensityBar>

            <DensityBar v-else-if="metricScale !== undefined && metricSet != undefined"
                        :tScale="metricScale[contextType]"
                        :dataList="metricSet[contextType]"
                        :height="machine.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
            ></DensityBar>
        </g>
        <g v-if="machine.extend === true">
            <line :x1="3 + 6" :x2="3 + 6"
                  :y1="machine.config.unitHeight + machine.config.unitHeight / 2"
                  :y2="machine.config.height - machine.config.unitHeight / 2"
                  stroke="grey" stroke-width="0.3"
            ></line>
            <circle :cx=" 3 +6" :cy="machine.config.unitHeight + machine.config.unitHeight / 2" r="3" fill="grey"></circle>
            <circle :cx=" 3 +6" :cy="machine.config.height - machine.config.unitHeight / 2" r="3" fill="grey"></circle>
        </g>

        <g v-if="values !== undefined && machine.extend === true" :transform="'translate(' + [0, machine.config.unitHeight] + ')'">
            <g class="taskContainer" :id="task.tid" v-for="(task, index) in values" :key="task.tid" :transform="'translate(' + [headLength, 0] + ')'">
                <TaskRow :app="app"
                         :task="task" :brothers="values" :index="index"
                         :width="width - headLength"
                         :marginY="marginY"
                         :textMarginY="textMarginY"
                         :headConfig="headConfig"
                         :durationLength = "width - taskDurationX"
                         :timeScale="timeScale"
                         :strokeColor="strokeColor"
                         :machineSize="machineSize"
                         :srcNestMap="srcNestMap"
                         :dstNestMap="dstNestMap"
                         :dataInfo="task.counter"
                         :dataSummary="dataSummary"
                         :contextType="contextType"
                         :tScale="tScale"
                         :metricScale="metricScale"
                ></TaskRow>
            </g>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"
import TaskRow from "@/components-new/TaskListView/TaskNew/TaskRow";
import PercBar from "@/components-new/TaskListView/TaskNew/subcomponents/PercBar";
import DurationBar from "@/components-new/TaskListView/TaskNew/subcomponents/DurationBar";
import DensityBar from "@/components-new/TaskListView/TaskNew/subcomponents/DensityBar";
import {HighlightMode} from "@/utils/const/HightlightMode";
import {mapState} from "vuex";
// import Row from "./Row"
export default {
    name: "Row",
    props: ['app', 'widthRatio', 'machine', 'width', 'columns', 'headLength', 'taskCountLength',
        'index', 'brothers', 'cellWidth', 'timeScale', 'taskNum',
        'maxDuration', 'headConfig', 'strokeColor', 'textMarginY',
        'srcNestMap', 'dstNestMap', 'contextType', 'tScale', 'metricScale',
            'vertexHover',
    ],
    components:{ TaskRow, PercBar, DurationBar, DensityBar },
    data(){
        return {
            taskStart: 0,
            taskEnd: 0,
            marginY: 2,
            machineSize: 0,
            dataSummary: undefined,
            metricSet: undefined,
            machineHighlightMode: HighlightMode.NONE,
        }
    },
    mounted(){
        // this.taskDurationX = this.headLength + this.cellWidth + this.taskCountLength
        this.taskStart = d3.min(this.machine.taskTreeModelList, task=>task.start)
        this.taskEnd = d3.max(this.machine.taskTreeModelList, task=>task.end)
        this.machineSize = this.machine.config.unitHeight - this.marginY * 2 - 4 * 2
        const offsetY = (this.machine.config.unitHeight + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
        d3.select(this.$el).select('.name').attr('y', offsetY)

        // this.subvalues = this.machine.values

        this.dataSummary = {}
        this.app.counterKeys.forEach(key=>{
            this.dataSummary[key] = d3.extent(this.machine.taskTreeModelList, task => task.counter[key])
        })
        this.dataSummary['TimeUsageList'] = this.machine.taskTreeModelList.map(task=>task.end - task.start)

        this.metricSet = {}

        this.app.counterKeys.forEach(key=>{
            const metric = []
            this.metricSet[key] = metric
            this.machine.taskTreeModelList.forEach(task => {
                if (key in task.counter) {
                    metric.push(task.counter[key])
                }
            })
        })
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
            this.machine.extend = !this.machine.extend
            if(this.machine.extend && this.machine.taskTreeModelList != undefined){
                this.machine.config.height = d3.sum(this.machine.taskTreeModelList, d=>d.config.height) + this.machine.config.unitHeight
            }else {
                this.machine.config.height = this.machine.config.unitHeight
            }
        },
        computeMachineHighlightMode() {
            for (const task of this.machine.taskTreeModelList) {
                if (task.interact.highlightMode !== HighlightMode.NONE) {
                    this.machineHighlightMode = task.interact.highlightMode;
                    return;
                }
            }
            this.machineHighlightMode = HighlightMode.NONE;
        }
    },
    watch: {
        totalHeight(){
            this.machine.config.height = this.totalHeight + this.machine.config.unitHeight
        },
        height() {
            console.log('heigth changed vertex', this.height)
        },
        outerSelect() {
            if (this.outerSelect && !this.machine.extend) {
                this.clickExtend();
            }
        },
        taskListHighlightSign() {
            this.computeMachineHighlightMode();
        },
    },
    computed: {
        ...mapState('comparison', {
            colorSchema: state => state.colorSchema,
        }),
        taskListHighlightSign() {
            return this.app.signs.taskListHighlightSign;
        },
        outerSelect() {
            return this.machine.config.outerSelect;
        },
        currentStroke(){
            if (this.machineHighlightMode !== HighlightMode.NONE) {
                switch (this.machineHighlightMode) {
                    case HighlightMode.CURRENT: return this.colorSchema['highlightAsCurrent'];
                    case HighlightMode.PROVIDER: return this.colorSchema['highlightAsProvider'];
                    case HighlightMode.CONSUMER: return this.colorSchema['highlightAsConsumer'];
                }
            }
            if (this.outerSelect || this.vertexHover) {
                return 'purple'
            }
            return 'grey'
        },
        strokeWidth(){
            if(this.outerSelect || this.machineHighlightMode !== HighlightMode.NONE || this.vertexHover){
                return '1.5'
            }
            return '0.3'
        },
        generateTriangle(){
            let length = 12
            let width = 10
            const l1 = 5
            const t1 = (this.machine.config.unitHeight - length) / 2
            const l2 = l1 - 2
            const t2 = (this.machine.config.unitHeight - width) / 2
            if(!this.machine.extend) {
                const array = [[l1, t1], [l1 + width, t1 + length / 2], [l1 , t1 + length]]
                let line = d3.line().x(d=>d[0]).y(d=>d[1])
                return line(array)
            }else{
                const array = [[l2, t2], [l2 + length, t2], [l2 + length / 2, t2 + width]]
                let line = d3.line().x(d=>d[0]).y(d=>d[1])
                return line(array)
            }
        },
        taskDurationX() {
            return this.cellWidth + this.taskCountLength;
        },
        taskLength() {
            return this.width - this.taskDurationX;
        },
        height(){
            return this.machine.config.unitHeight - 2 * this.marginY
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
            return this.machine.taskTreeModelList
        },
        totalHeight(){
            if(this.machine.taskTreeModelList){
                return d3.sum(this.machine.taskTreeModelList, d=>d.config.height)
            }else{
                return this.machine.config.height
            }
        }
    }
}
</script>

<style scoped>

</style>
