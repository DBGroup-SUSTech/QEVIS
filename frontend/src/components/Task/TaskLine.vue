<template>
    <g>

        <!--        <rect stroke="purple" stroke-width="1" fill="pink"-->
        <!--              :width="width" :height="height"></rect>-->

        <circle v-if="type == true" :r="(unitHeight) / 2" :cx="unitHeight/2 + 3" :cy="(unitHeight) / 2"
                @click="clickGlyph"
                @mouseover="mouseoverTask"
                @mouseout="mouseoutTask"
                :fill="colorSchema[task.vertex.hvType]" fill-opacity="0.3" :stroke="colorSchema[task.vertex.hvType]">
            <title>{{counterStr}}</title>
        </circle>
        <!--        <path :d="semicirclePath" :transform="'translate(' + [unitHeight / 2 + 3, unitHeight / 2] + ')'"-->
        <!--              v-if="type == true && hasOutlier" @click="clickGlyph" :fill="'rgb(179,1,157)'"></path>-->
        <rect v-if="type == false" :width="(unitHeight)" :height="(unitHeight)" :x="3"
              @click="clickGlyph" :fill="colorSchema[task.vertex.hvType]"
              fill-opacity="0.3" :stroke="colorSchema[task.vertex.hvType]">
            <title>{{counterStr}}</title>
        </rect>
        <!--        <polygon :points="trianglePoints" v-if="type == false && hasOutlier" :width="(unitHeight)" :height="(unitHeight)" :x="3"-->
        <!--              @click="clickGlyph" :fill="'rgb(179,1,157)'" fill-opacity="0.7"></polygon>-->

        <g v-if="expanded">

            <!--            <rect stroke="grey" stroke-width="1" fill="none"-->
            <!--                  :x="unitHeight*2.5"-->
            <!--                  :width="timeScale(task.end_time - task.start_time)" :height="exBoxHeight"></rect>-->
            <line style="stroke:black; stroke-width:1"
                  :x1="unitHeight*2.5" :y1="0"
                  :x2="unitHeight*2.5" :y2="exBoxHeight"/>

            <g :transform="'translate(' + [unitHeight * 2.5, exBoxHeight] + ')'">
                <line style="stroke:black; stroke-width:0.3" stroke-dasharray="4 1"
                      :x1="0"
                      :y1="0"
                      :x2="width - unitHeight * 2.5"
                      :y2="0">
                </line>
                <circle r=2.5 fill="grey" :cx="xScale(this.task.start_time)"></circle>
                <circle r=2.5 fill="grey" :cx="xScale(this.task.end_time)"></circle>
            </g>

            <g :transform="'translate(' + [unitHeight + 5, 0] + ')'">
                <rect :fill="isVtxTotOutlier ? outlierColors[0] : outlierColors[2]" fill-opacity="0.6"
                      :x="0" :y="0"
                      :height="exFirstHeight - 2" :width="4"/>
                <rect :fill="isVtxMachineTotOutlier ? outlierColors[1] : outlierColors[2]" fill-opacity="0.6"
                      :x="5" :y="0"
                      :height="exFirstHeight - 2" :width="4"/>
            </g>

            <g :transform="'translate(' + [unitHeight + 5, exFirstHeight] + ')'">
                <rect v-for="(isOutlier, idx) in vertexStepOutliers" :key="'o1'+idx"
                      :fill="isOutlier ? outlierColors[0] : outlierColors[2]" fill-opacity="0.6"
                      :x="0" :y="exLineHeight * idx"
                      :height="exRectHeight" :width="3"/>
                <rect v-for="(isOutlier, idx) in vtxMachineStepOutliers" :key="'o2'+idx"
                      :fill="isOutlier ? outlierColors[1] : outlierColors[2]" fill-opacity="0.6"
                      :x="4" :y="exLineHeight * idx"
                      :height="exRectHeight" :width="3"/>
            </g>

            <!--            <g :transform="'translate(' + [unitHeight * 2.5, exFirstHeight] + ')'">-->
            <!--                <rect v-for="(step, index) in stepInfos" :key="'rect' + index"-->
            <!--                        :x="timeScale(step.startTime - task.start_time)" :fill="stepColors[index]" fill-opacity="1"-->
            <!--                        :y="index * exLineHeight"-->
            <!--                        :height="exRectHeight"-->
            <!--                        :width="timeScale(step.endTime - task.start_time) - timeScale(step.startTime - task.start_time)"-->
            <!--                ></rect>-->

            <!--                <rect v-for="(step, index) in stepInfos" :key="'rect_border' + index" stroke="grey" stroke-width="1" fill="none"-->
            <!--                      :x="timeScale(step.startTime - task.start_time)"-->
            <!--                      :y="index * exLineHeight"-->
            <!--                      :height="exRectHeight"-->
            <!--                      :width="Math.max(0.5, timeScale(step.endTime - task.start_time) - timeScale(step.startTime - task.start_time))"></rect>-->
            <!--            </g>-->

            <g :transform="'translate(' + [unitHeight * 2.5, 0] + ')'">
                <line style="stroke:#6c6c6c; stroke-width:0.2"
                      :x1="0"
                      :y1="0"
                      :x2="width - unitHeight * 2.5"
                      :y2="0"/>
                <Boxplot :height="exFirstHeight - 2"
                         :color="'black'"
                         :bpSrc="mode === 'v' ? bpTotV : bpTotVM"/>
                <circle r='3' :fill="'#000000'"
                        :cx="timeScale(task.end_time - task.start_time)" :cy="exFirstHeight/2 - 1"/>
            </g>

            <g :transform="'translate(' + [unitHeight * 2.5, exFirstHeight] + ')'">
                <line v-for="(_, index) in stepInfos" :key="'l'+index"
                      style="stroke:#6c6c6c; stroke-width:0.2"
                      :x1="0"
                      :y1="index * exLineHeight - (exLineHeight - exRectHeight) / 2"
                      :x2="width - unitHeight * 2.5"
                      :y2="index * exLineHeight - (exLineHeight - exRectHeight) / 2"/>
                <Boxplot v-for="(step, index) in stepInfos" :key="index"
                         :transform="'translate(' + [0, index * exLineHeight] + ')'"
                         :height="exRectHeight"
                         :color="step.color"
                         :bpSrc="mode === 'v' ? step.bpV : step.bpVM"/>
                <circle v-for="(step, index) in stepInfos" :key="'c'+index"
                        :transform="'translate(' + [0, index * exLineHeight + exRectHeight / 2] + ')'"
                        r='2.5' :fill="'#000000'" :cx="timeScale(step.timeLength)"/>
            </g>

        </g>
        <g v-else>

            <g :transform="'translate(' + [unitHeight + 5, 0] + ')'">
                <rect :fill="isVtxOutlier ? outlierColors[0] : outlierColors[2]" fill-opacity="0.6"
                      :height="unitHeight" :width="3"/>
                <rect :transform="'translate(' + [4, 0] + ')'"
                      :fill="isVtxMachineOutlier ? outlierColors[1] : outlierColors[2]" fill-opacity="0.6"
                      :height="unitHeight" :width="3"/>
            </g>

            <rect stroke="grey" stroke-width="1" fill="none"
                  :x="unitHeight*2.5"
                  :width="timeScale(task.end_time - task.start_time)" :height="unitHeight"></rect>

            <g :transform="'translate(' + [unitHeight * 2.5, unitHeight] + ')'">
                <line style="stroke:black; stroke-width:0.3" stroke-dasharray="4 1"
                      :x1="0"
                      :y1="0"
                      :x2="width - unitHeight * 2"
                      :y2="0">
                </line>
                <circle r=2.5 fill="grey" :cx="xScale(this.task.start_time)"></circle>
                <circle r=2.5 fill="grey" :cx="xScale(this.task.end_time)"></circle>
            </g>

            <g :transform="'translate(' + [unitHeight * 2.5, 0] + ')'">
                <rect v-for="(step, index) in stepInfos" :key="index"
                      :x="timeScale(step.startTime - task.start_time)" :fill="stepColors[index]" fill-opacity="1"
                      :y="index * unitHeight / 5"
                      :height="unitHeight / 5"
                      :width="timeScale(step.endTime - task.start_time) - timeScale(step.startTime - task.start_time)"
                ></rect>

                <g>
                    <circle v-for="(step, index) in stepInfos" :key="index" r="2" :fill="step.color"
                            :cy="index * unitHeight / 5"
                            :cx="timeScale(step.startTime - task.start_time)"></circle>
                </g>
                <g>
                    <circle v-for="(step, index) in stepInfos" :key="index" r="2" :fill="step.color"
                            :cy="index * unitHeight / 5"
                            :cx="timeScale(step.endTime - task.start_time)"></circle>
                </g>

            </g>
        </g>

        <g v-show="expanded" :transform="'translate(' + [unitHeight * 2.5, exBoxHeight + 5] + ')'">
            <RecvHeatmapSvg :width="width-unitHeight*2.5" :height="rhRectHeight" :machineId="task.machine_id"
                            :task="task" :type="'recv'" :rhRenderSign="rhRenderSign"/>
        </g>
        <g v-show="expanded" :transform="'translate(' + [unitHeight * 2.5, exBoxHeight + rhHeight / 2 + 5] + ')'">
            <RecvHeatmapSvg :width="width-unitHeight*2.5" :height="rhRectHeight" :machineId="task.machine_id"
                            :task="task" :type="'send'" :rhRenderSign="rhRenderSign"/>
        </g>

    </g>
</template>

<script>
import {mapState} from "vuex";
import * as d3 from "d3";
import Boxplot from "@/components/Task/Boxplot";
import RecvHeatmapSvg from "@/components/Task/RecvHeatmapSvg";

const semicircleGen = d3.arc().innerRadius(0).startAngle(Math.PI / 4).endAngle(Math.PI * 5 / 4)

export default {
    name: "TaskLine",
    components: {RecvHeatmapSvg, Boxplot},
    props:['timeScale', 'xScale', 'task', 'height', 'unitHeight',
        'width', 'expandedHeight', 'outliers', 'expanded', 'rhHeight'],
    data () {
        let exBoxHeight = this.expandedHeight - this.rhHeight
        return {
            exBoxHeight: exBoxHeight,
            exLineHeight: exBoxHeight / 6.5,
            exFirstHeight: exBoxHeight / 6.5 * 1.5,
            exRectHeight: exBoxHeight / 6.5 * 0.80,
            semicirclePath: semicircleGen({outerRadius: this.unitHeight / 2}),
            trianglePoints: [this.unitHeight+3, 0] + ' ' + [this.unitHeight+3, this.unitHeight]
                + ' ' + [3, this.unitHeight],
            mode: 'vm',       // '': compressed, 'n': normal expand, 'v': vertex, 'vm': vertex+machine
            rhRectHeight: this.rhHeight / 2 * 0.8,
            rhRenderSign: false,
        }
    },
    methods: {
        clickGlyph () {
            this.$emit('clickLineGlyph', this.task.task_id)
            if (!this.task.recv) {
                console.info('no recv, first running task?', this.task)
            }
            /*
Task example
FILE_BYTES_READ: 30532098
FILE_BYTES_WRITTEN: 53604517
HDFS_BYTES_READ: 0
INPUT_RECORDS_PROCESSED: 0
INPUT_SPLIT_LENGTH_BYTES: 0
OUTPUT_BYTES: 1563696
OUTPUT_RECORDS: 60680
SHUFFLE_BYTES: 22990862
SHUFFLE_BYTES_DISK_DIRECT: 8276370
SHUFFLE_BYTES_TO_DISK: 0
SHUFFLE_BYTES_TO_MEM: 14714492

Map example
FILE_BYTES_READ: 2896
FILE_BYTES_WRITTEN: 14653267
HDFS_BYTES_READ: 536879104
INPUT_RECORDS_PROCESSED: 3762459
INPUT_SPLIT_LENGTH_BYTES: 536870912
OUTPUT_BYTES: 22644396
OUTPUT_RECORDS: 890764
SHUFFLE_BYTES: 0
SHUFFLE_BYTES_DISK_DIRECT: 0
SHUFFLE_BYTES_TO_DISK: 0
SHUFFLE_BYTES_TO_MEM: 0
             */
            console.log(this.counterStr)
            this.rhRenderSign = !this.rhRenderSign
        },
        mouseoverTask(){
            this.task.layout.selected = true;
        },
        mouseoutTask(){
            this.task.layout.selected = false;
        }
    },
    computed:{
        ...mapState('simulation', {
            maxTimeLength: state => state.maxTimeLength,
            colorSchema: state=>state.colorSchema,
            stepColors: state => state.layoutConfig.stepColors,
            outlierColors: state => state.layoutConfig.outlierColors,
            counters: state => state.counters,
        }),
        counter() {
            return this.counters[this.task.task_id]
        },
        counterStr() {
            let ret = ''
            for(let key in this.counter) {
                ret += key + ': ' + (this.counter[key] / Math.pow(2, 20)) + '\n'
            }
            return ret
        },
        taskTimeLen () {
            return this.task.end_time - this.task.start_time
        },
        type(){
            return this.task.vertex.hvType == 'Map';
        },
        stepInfos() {
            if (!this.boxplotV || !this.boxplotVM) {
                return []
            }
            let stepInfos = [];
            // let start_time = this.task.start_time;
            for(let i = 0, ilen = this.task.time_len.length; i<ilen; i++) {
                let stepName = 'step' + i
                stepInfos.push({
                    'startTime': this.task.step_info[i*2],
                    'endTime': this.task.step_info[i*2+1],
                    'timeLength': this.task.step_info[i*2+1] - this.task.step_info[i*2],
                    'color': this.stepColors[i],
                    'bpV': this.boxplotV[stepName].map(v => this.timeScale(v)),
                    'bpVM': this.boxplotVM[stepName].map(v => this.timeScale(v)),
                })
            }
            // console.log('stepInfos', this.maxTimeLength, this.task.step_info, stepInfos)
            return stepInfos;
        },
        bpTotV () {
            if (!this.boxplotV) {
                return []
            }
            return this.boxplotV['tot'].map(v => this.timeScale(v))
        },
        bpTotVM () {
            if (!this.boxplotVM) {
                return []
            }
            return this.boxplotVM['tot'].map(v => this.timeScale(v))
        },
        vertexStepOutliers () {
            if (!this.boxplotV || !this.stepInfos) {
                return []
            }
            let ret = []
            for (let i = 0; i < 5; i++) {
                let outlierPoint = this.boxplotV['step' + i][4]
                ret.push(outlierPoint < this.stepInfos[i]['timeLength'])
            }
            return ret
        },
        vtxMachineStepOutliers () {
            if (!this.boxplotVM || !this.stepInfos) {
                return []
            }
            let ret = []
            for (let i = 0; i < 5; i++) {
                let outlierPoint = this.boxplotVM['step' + i][4]
                ret.push(outlierPoint < this.stepInfos[i]['timeLength'])
            }
            return ret
        },
        isVtxTotOutlier () {
            if (!this.boxplotV) {
                return false
            }
            let outlierPoint = this.boxplotV['tot'][4]
            return outlierPoint < this.taskTimeLen
        },
        isVtxMachineTotOutlier () {
            if (!this.boxplotVM) {
                return false
            }
            let outlierPoint = this.boxplotVM['tot'][4]
            return outlierPoint < this.taskTimeLen
        },
        isVtxOutlier () {
            return this.isVtxTotOutlier || this.vertexStepOutliers.some(isOutlier => isOutlier)
        },
        isVtxMachineOutlier () {
            return this.isVtxMachineTotOutlier || this.vtxMachineStepOutliers.some(isOutlier => isOutlier)
        },
        boxplotV () {
            if (!this.outliers) {
                return null
            }
            return this.outliers['v']
        },
        boxplotVM () {
            if (!this.outliers) {
                return null
            }
            return this.outliers['vm'][this.task.machine_id]
        },
    }

}
</script>

<style scoped>

</style>
