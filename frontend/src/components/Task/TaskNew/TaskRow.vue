<template>
    <g :transform="rowTransform">
        <rect style="rx:3; ry:3" :width="width" :height="height"
              :fill="headConfig.contextFill"
              :y="marginY"
              :stroke-width="headConfig.strokeWidth"
              fill-opacity="0.3" stroke="grey"></rect>
        <text class="name" x='10' :y="textMarginY" style="font-size: 10px">{{data.task_id.slice(-10)}}</text>
        <g :transform="'translate(' + [taskDurationX,0] + ')'">
            <DurationBar v-if="contextType === 'Duration'" :height="data.config.unitHeight" :width="durationLength" :strokeColor="strokeColor"
                         :start="data.start_time" :end="data.end_time" :barHeight="machineSize" :timeScale="timeScale"
            ></DurationBar>
            <DensityBar v-else-if="contextType === 'TimeUsage'"
                        :tScale="tScale"
                        :height="data.config.unitHeight" :width="durationLength" :barHeight="machineSize" :marginLR="10"
                        :val="data.end_time - data.start_time"
            ></DensityBar>
            <PercBar v-else
                     :height="data.config.unitHeight" :width="durationLength" :barHeight="machineSize" :marginLR="10"
                     :maxVal="dataSummary[contextType][1]" :val="dataInfo[contextType]"
                     :showMax="true"
            ></PercBar>
        </g>
    </g>
</template>

<script>
// :dataList="dataSummary['TimeUsageList']"
import * as d3 from "d3"
import DurationBar from "@/components/Task/TaskNew/subcomponents/DurationBar";
import PercBar from "@/components/Task/TaskNew/subcomponents/PercBar";
import DensityBar from "@/components/Task/TaskNew/subcomponents/DensityBar";
export default {
    name: "TaskRow",
    props: ['widthRatio', 'data', 'width', 'columns', 'headLength', 'taskCountLength',
        'index', 'brothers', 'cellWidth', 'timeScale', 'taskNum', 'durationLength',
        'maxDuration', 'headConfig', 'strokeColor', 'textMarginY', 'srcNestMap', 'dstNestMap',
        'dataInfo', 'dataSummary', 'contextType' ,'tScale'
    ],
    components:{DurationBar, PercBar, DensityBar },
    data(){
        return {
            taskStart: 0,
            taskEnd: 0,
            marginY: 2,
            machineSize: 0,
            taskDurationX: 0,
            taskLength: 0,
            taskCountX: 0,
            srcList: [], //上游任务
            dstList: [], // 下游任务
            renderComponent: true,

            // height: 0
        }
    },
    mounted(){
        this.taskDurationX = this.width - this.durationLength
        // this.taskStart = d3.min(this.data.values, task=>task.start_time)
        // this.taskEnd = d3.max(this.data.values, task=>task.end_time)
        this.machineSize = this.data.config.unitHeight - this.marginY * 2 - 4 * 2
        // this.height = this.data.config.height-2*this.marginY
        // console.log('this data1', this.data, this.srcNestMap, this.dstNestMap)
        // console.log('this data2', this.data.task_id, this.srcNestMap.get(this.data.task_id), this.dstNestMap.get(this.data.task_id))
        // const offsetY = (this.data.config.unitHeight + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
        // d3.select(this.$el).select('.name').attr('y', offsetY)
        //
        // this.taskCountX = this.cellWidth
        // this.taskDurationX = this.cellWidth + this.taskCountLength
        // this.taskLength = this.width - this.taskDurationX

        // console.log('dataSummary', this.dataSummary)
        // console.log('taskInfo', this.dataInfo)

    },
    methods: {
        clickOnTask(){
            this.data.config.unitHeight += 5
            this.data.config.height += 5
        },
        forceRerender() {
            this.renderComponent = false;
            this.$nextTick(() => {
                this.renderComponent = true;
            });
        },
        sum(arr) {
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
        clickExtend(){
            this.data.extend = !this.data.extend
            if(this.data.extend && this.data.values != undefined){
                this.data.config.height = d3.sum(this.data.values, d=>d.config.height) + this.data.config.unitHeight + this.data.config.detailHeight
            }else {
                this.data.config.height = this.data.config.unitHeight
            }

        }
    },
    watch: {
        height(){

        },
        totalHeight(){
            // console.log('machine totalHeight update ', this.totalHeight)
            // this.data.config.height = this.totalHeight + this.data.config.unitHeight
        }
    },
    computed: {
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
        height(){
            return this.data.config.unitHeight - 2 * this.marginY
        },
    }
}
</script>

<style scoped>

</style>