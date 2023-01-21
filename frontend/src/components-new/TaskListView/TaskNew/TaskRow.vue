<template>
    <!--                 :fill="headConfig.contextFill"-->
    <g :transform="rowTransform" @mouseover="mouseover" @mouseout="mouseout">
        <rect style="rx:3; ry:3" :width="width" :height="height"
              :fill="'white'"
              :y="marginY"
              :stroke-width="strokeWidth"
              :stroke="currentStroke"
              fill-opacity="0.3" ></rect>
        <text class="name" x='5' :y="textMarginY" style="font-size: 10px; user-select: none;"
              ref="taskLabel"
              @mouseenter="enterTaskLabel"
              @mouseleave="leaveTaskLabel">{{applyEllipsis(task.suffix)}}</text>
        <g :transform="'translate(' + [taskDurationX,0] + ')'">
            <DurationBar v-if="contextType === 'Duration'" :height="task.config.unitHeight" :width="durationLength" :strokeColor="strokeColor"
                         :start="task.start" :end="task.end" :barHeight="machineSize" :timeScale="timeScale"
            ></DurationBar>
            <DensityBar v-else-if="contextType === 'TimeUsage'"
                        :tScale="tScale"
                        :height="task.config.unitHeight" :width="durationLength" :barHeight="machineSize" :marginLR="10"
                        :val="task.end - task.start"
            ></DensityBar>

            <DensityBar v-else-if="metricScale !== undefined"
                        :tScale="metricScale[contextType]"
                        :height="task.config.unitHeight" :width="durationLength" :barHeight="machineSize" :marginLR="10"
                        :val="dataInfo[contextType]"
            ></DensityBar>

            <PercBar v-if="false"
                     :height="task.config.unitHeight" :width="durationLength" :barHeight="machineSize" :marginLR="10"
                     :maxVal="dataSummary[contextType][1]" :val="dataInfo[contextType]"
                     :showMax="true"
            ></PercBar>
        </g>
    </g>
</template>

<script>

import * as d3 from "d3"
import DurationBar from "@/components-new/TaskListView/TaskNew/subcomponents/DurationBar";
import PercBar from "@/components-new/TaskListView/TaskNew/subcomponents/PercBar";
import DensityBar from "@/components-new/TaskListView/TaskNew/subcomponents/DensityBar";
import {HighlightMode} from "@/utils/const/HightlightMode";
import {mapState} from "vuex";
export default {
    name: "TaskRow",
    props: ['app', 'widthRatio', 'task', 'width', 'columns', 'headLength', 'taskCountLength',
        'index', 'brothers', 'cellWidth', 'timeScale', 'taskNum', 'durationLength',
        'maxDuration', 'headConfig', 'strokeColor', 'textMarginY', 'srcNestMap', 'dstNestMap',
        'dataInfo', 'dataSummary', 'contextType' ,'tScale', 'metricScale'
    ],
    components:{DurationBar, PercBar, DensityBar },
    data(){
        return {
            taskStart: 0,
            taskEnd: 0,
            marginY: 2,
            machineSize: 0,
            // taskDurationX: 0,
            taskLength: 0,
            taskCountX: 0,
            srcList: [], //上游任务
            dstList: [], // 下游任务
            renderComponent: true,

            // height: 0
        }
    },
    mounted(){
        // this.taskDurationX = this.width - this.durationLength
        // this.taskStart = d3.min(this.data.values, task=>task.start_time)
        // this.taskEnd = d3.max(this.data.values, task=>task.end_time)
        this.machineSize = this.task.config.unitHeight - this.marginY * 2 - 4 * 2
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

        // d3.select(this.$el).selectAll('.root').on('mouseover', ()=>{
        //     this.task.origin.layout.selectCurrent = true
        // }).on('mouseout', ()=>{
        //     this.data.origin.layout.selectCurrent = false
        // })

    },
    methods: {
        mouseover() {
            this.$store.commit('comparison/changeHighlightTask', {
                app: this.app,
                task: this.task._mainObj,
                toHighlight: true,
            });
        },
        mouseout() {
            this.$store.commit('comparison/changeHighlightTask', {
                app: this.app,
                task: this.task._mainObj,
                toHighlight: false,
            });
        },
        applyEllipsis(text) {
            return '...' + text.substring(text.length - 7);
        },
        clickOnTask(){
            this.task.config.unitHeight += 5
            this.task.config.height += 5
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
            this.task.extend = !this.task.extend
            this.task.config.height = this.task.config.unitHeight

        },
        enterTaskLabel() {
            // const counter = this.counters[this.data.task_id];
            // const bcRect = this.$refs.taskLabel.getBoundingClientRect();
            //
            // this.$store.commit('comparison/changeTaskTooltipData', {
            //     show: true,
            //     layout: {
            //         x: bcRect.x + bcRect.width,
            //         y: bcRect.y + bcRect.height,
            //         width: null,    // null for 'auto'
            //     },
            //     data: counter,
            //     step_info: this.data.step_info,
            // });

            this.$store.commit('comparison/changeTaskTooltipTask', this.task);
        },
        leaveTaskLabel() {
            this.$store.commit('comparison/changeTaskTooltipTask', null);
        },
    },
    watch: {
        height(){

        },
        totalHeight(){
            // console.log('machine totalHeight update ', this.totalHeight)
            // this.data.config.height = this.totalHeight + this.data.config.unitHeight
        },
    },
    computed: {
        ...mapState('comparison', {
            colorSchema: state => state.colorSchema,
        }),
        outerSelect() {
            return this.task.config.outerSelect;
        },
        currentStroke(){
            if (this.task.interact.highlightMode !== HighlightMode.NONE) {
                switch (this.task.interact.highlightMode) {
                    case HighlightMode.CURRENT: return this.colorSchema['highlightAsCurrent'];
                    case HighlightMode.PROVIDER: return this.colorSchema['highlightAsProvider'];
                    case HighlightMode.CONSUMER: return this.colorSchema['highlightAsConsumer'];
                }
            }
            if (this.outerSelect) {
                return 'purple'
            }
            return 'grey'
        },
        strokeWidth(){
            if(this.outerSelect || this.task.interact.highlightMode !== HighlightMode.NONE){
                return '1.5'
            }
            return '0.3'
        },
        counters() {
            return this.$store.state.comparison.appShowingTask?.counters ?? {};
        },
        taskDurationX(){
            return this.width - this.durationLength
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
        height(){
            return this.task.config.unitHeight - 2 * this.marginY
        },
    }
}
</script>

<style scoped>

</style>
