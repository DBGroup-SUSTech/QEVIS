<template>
    <g :transform="rowTransform" v-if="renderComponent">
        <g class="vertex-row" @mouseenter="mouseenter" @mouseleave="mouseleave">
            <rect style="rx:1; ry:1" :width="width" :height="this.vertex.config.unitHeight - 2 * marginY"
                  :fill="headConfig.contextFill" :y="marginY"
                  :stroke-width="strokeWidth"
                  fill-opacity="0.2" :stroke="currentStroke"></rect>
            <text class="name" x='18' :y="textMarginY"
                  style="font-size: 10px; user-select: none;">{{this.vertex.vertexName.split(' ')[0][0] + this.vertex.vertexName.split(' ')[1]}}</text>
            <path v-if="vertex.extend!==undefined" :d="generateTriangle"
                  style="cursor: pointer"
                  :fill="'#3e3e3e'" stroke="white" @click="clickExtend"></path>
            <!--        <g v-if="vertex.extend !== true">-->
            <g>
                <g :transform="'translate(' + [headLength, 0] + ')'">
                    <PercBar :height="vertex.config.unitHeight" :width="cellWidth" :barHeight="machineSize" :marginLR="10"
                             :maxVal="machineNames.length" :val="subvalues.length"
                             :showMax="true"
                    ></PercBar>`
                </g>
                <g :transform="'translate(' + [taskCountX, 0] + ')'">
                    <PercBar :height="vertex.config.unitHeight" :width="cellWidth" :barHeight="machineSize" :marginLR="10"
                             :maxVal="taskNum" :val="extractTasks().length"
                             :showMax="true"
                    ></PercBar>
                </g>
                <g :transform="'translate(' + [taskDurationX, 0] + ')'">
                    <DurationBar v-if="contextType==='Duration'" :height="vertex.config.unitHeight" :width="taskLength" :strokeColor="strokeColor"
                                 :start="vertexStart" :end="vertexEnd" :barHeight="machineSize" :timeScale="timeScale"
                    ></DurationBar>
                    <DataLayoutBar v-else-if="contextType === 'DataLayout'"
                                   :tScale="dataLayoutScale"
                                   :dataList="machineDataSize"
                                   :height="vertex.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
                    ></DataLayoutBar>
                    <DensityBar v-else-if="contextType === 'TimeUsage'"
                                :tScale="tScale"
                                :dataList="timeUsageList"
                                :height="vertex.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
                                :appendCtxType="appendCtxType"
                                :colorList="colorList"
                                :isRenderColor="isRenderColor"
                                :sortedDataList="metricSortedSet['TimeUsage']"
                                :isShowOutlier="isShowOutlier"
                                :outlierNum="targetOutlierTasksNum"
                                :contextType = "contextType"
                    ></DensityBar>
                    <!--                &lt;!&ndash;                <PercBar v-else&ndash;&gt;-->
                    <!--                &lt;!&ndash;                         :height="vertex.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"&ndash;&gt;-->
                    <!--                &lt;!&ndash;                         :maxVal="dataSummary[contextType][1]" :val="dataSummary[contextType][0]"&ndash;&gt;-->
                    <!--                &lt;!&ndash;                         :showMax="true"&ndash;&gt;-->
                    <!--                &lt;!&ndash;                ></PercBar>&ndash;&gt;-->

                    <DensityBar v-else
                                :tScale="metricScale[contextType]"
                                :dataList="metricSet[contextType]"
                                :height="vertex.config.unitHeight" :width="taskLength" :barHeight="machineSize" :marginLR="10"
                                :appendCtxType="appendCtxType"
                                :colorList="colorList"
                                :isRenderColor="isRenderColor"
                                :sortedDataList="metricSortedSet[contextType]"
                                :isShowOutlier="isShowOutlier"
                                :outlierNum="targetOutlierTasksNum"
                                :contextType = "contextType"
                    ></DensityBar>
                </g>
            </g>
        </g>

        <!--        <g v-if="vertex.extend === true">-->
        <g v-if="false">
            <g class="statistics" :transform="'translate(' + [headLength, this.vertex.config.unitHeight] + ')'">
                <VertexView v-if="vertexEnd != 0" :width="width-headLength" :height="this.detailHeight"
                            :vertexStart="vertexStart" :vertexEnd="vertexEnd" :maxDuration="maxDuration"
                            :tasks="extractTasks()"
                            :headConfig="headConfig">
                </VertexView>
            </g>
        </g>
        <g v-if="vertex.extend === true">
            <line :x1="3 + 6" :x2="3 + 6"
                  :y1="vertex.config.unitHeight + vertex.config.unitHeight / 2 + 6"
                  :y2="vertex.config.height - vertex.config.unitHeight / 2 - 6"
                  stroke="grey" stroke-width="0.3"
            ></line>
            <circle :cx=" 3 +6" :cy="vertex.config.unitHeight + vertex.config.unitHeight / 2" r="3" fill="grey"></circle>
            <circle :cx=" 3 +6" :cy="vertex.config.height - vertex.config.unitHeight / 2" r="3" fill="grey"></circle>
        </g>
        <g v-if="subvalues !== undefined && vertex.extend === true"
           :transform="'translate(' + [0, this.vertex.config.unitHeight] + ')'">
            <g v-for="(subData, index) in subvalues" :key="subData.machineName" :transform="'translate(' + [headLength, 0] + ')'">
                <MachineRow :app="app" :widthRatio="widthRatio" :machine="subData" :width="width - headLength" :columns="columns"
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
                            :contextType="contextType"
                            :tScale="tScale"
                            :metricScale="metricScale"
                            :vertexHover="vertexHover"
                            :dataLayoutScale="dataLayoutScale"
                            :appendCtxType="appendCtxType"
                            :metricSortedSet="metricSortedSet"
                            :targetOutlierTasksNum="targetOutlierTasksNum"
                            :outlierBound="outlierBound"
                ></MachineRow>
            </g>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"
import MachineRow from "@/components-new/TaskListView/TaskNew/MachineRow";
import VertexView from "@/components-new/TaskListView/TaskNew/VertexView";
import PercBar from "@/components-new/TaskListView/TaskNew/subcomponents/PercBar";
import DurationBar from "@/components-new/TaskListView/TaskNew/subcomponents/DurationBar";
import DensityBar from "@/components-new/TaskListView/TaskNew/subcomponents/DensityBar";
import {HighlightMode} from "@/utils/const/HightlightMode";
import {mapState} from "vuex";
import DataLayoutBar from "@/components-new/TaskListView/TaskNew/subcomponents/DataLayoutBar";
// import Row from "./Row"


export default {
    name: "Row",
    props: [
            'app',
        'widthRatio',
        'vertex',   // VertexTreeModel
        'width', 'columns', 'index', 'brothers', 'timeScale',
        'start', 'end', 'machineNames', 'maxDuration', 'headConfig', 'taskNum',
        'srcNestMap', 'dstNestMap', 'contextType', 'dataLayoutTasks','appendCtxType','outlierBound'],
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
            headLength: 50,
            detailHeight: 100,
            marginY: 3,
            textMarginY: 19,
            taskLength: 0,
            // task count
            taskCountX: 0,
            // task duration
            taskDurationX: 0,
            taskCountLength: 0,

            timeUsageList: [],
            colorList: [],
            dataLayoutLenList:[],
            machineDataSize: {},

            tScale: undefined,
            dataLayoutScale:undefined,
            renderComponent: true,
            dataSummary: undefined,

            dataScale: undefined,
            metricScale: undefined,
            metricSet: undefined,
            vertexHover: false,

            metricSortedSet: undefined,
            targetOutlierTasksNum: 0,
            outlierColorList:[],
            isShowOutlier: true
        }
    },
    components:{
      DataLayoutBar,
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
        this.vertexStart = this.vertex.start;
        this.vertexEnd = this.vertex.end;

        const offsetY = (this.vertex.config.unitHeight + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
        this.textMarginY = offsetY

        this.machineSize = this.vertex.config.unitHeight - this.marginY * 2 - 4 * 2
        // console.log(this.vertex)
        let machineDataSize = this.machineDataSize
        let totalSum = 0
        this.vertex.tasks.forEach(t => {
          t.mapTrans.forEach(item => {
            let src = item.machine
            if (!machineDataSize[src]){
              machineDataSize[src] = 0
            }
            machineDataSize[src] += item.length
            totalSum += item.length
          })
        })
        this.dataLayoutScale = d3.scaleLinear().domain([0, totalSum]).range([0, this.taskLength])

        this.metricSortedSet = {}
        let tmp = [], idx = 0
        this.vertex.machineTreeModelList.forEach(machine=>{
            machine.taskTreeModelList.forEach(task=>{
              this.timeUsageList.push(task.end - task.start)
              tmp.push({"value":task.end - task.start, "taskId": task.tid, 'listIdx': idx})
              idx = idx + 1
              let c = 'black'
              if (task.vertex.type === 'Map'){
                if (task.mapTrans[0]){
                  if (task.mapTrans[0].machine && machine.machineName !==task.mapTrans[0].machine){
                    c = 'red'
                  }
                }
              }
              this.colorList.push(c)
            })
            tmp.sort((a, b) => (a.value > b.value)? 1 : -1)
            this.metricSortedSet["TimeUsage"] = tmp
                // this.dataLayoutLenList.push(task.)
            // ])
        })
        this.tScale = d3.scaleLinear().domain(d3.extent(this.timeUsageList)).range([0, this.taskLength])

        // let keys = Object.keys(Object.values(this.counters)[0])
        // this.dataSummary = {}
        // keys.forEach(key=>{
        //     // this.dataSummary[key] = d3.extent(this.values, task => this.counters[task.task_id][key])
        //     this.dataSummary[key] = [d3.min(this.data.values, machine => d3.min(machine.taskList, task=>this.counters[task.task_id][key])),
        //         d3.max(this.data.values, machine => d3.max(machine.taskList, task=>this.counters[task.task_id][key]))]
        // })
        // let machineTasks = {}
        // this.dataLayoutTasks.forEach(item =>{
        //
        // })
        this.metricSet = {}
        this.metricScale = {}
        // this.targetOutlierTasksSet = {}
        // let totalSize = 0
        this.app.counterKeys.forEach(key=>{
            const metric = []
            let metricOutlierTasks = [], idx = 0
            this.metricSet[key] = metric
            this.vertex.tasks.forEach(task => {
                if (key in task.counter) {
                    metric.push(task.counter[key])
                    metricOutlierTasks.push({"value": task.counter[key], "taskId":task.tid, 'listIdx':idx})
                    idx += 1
                }
            })
            // d3.sort
            metricOutlierTasks.sort((a,b)=>(a.value > b.value) ? 1 : -1)
            this.metricSortedSet[key] = metricOutlierTasks
            this.metricScale[key] = d3.scaleLinear()
                    .domain([0, d3.max(metric) ?? 0])
                    .range([0, this.taskLength])
        })
        this.targetOutlierTasksNum = Math.ceil(this.vertex.tasks.length * this.outlierBound)
        // console.log(this.metricSortedSet)
    },
    methods: {
        sum(arr) {
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
        forceRerender(){
            console.log('forec render in vertex', this.vertex)
            // Remove my-component from the DOM
            this.renderComponent = false;

            this.$nextTick(() => {
                // Add the component back in
                this.renderComponent = true;
            });
        },
        /**
         * @returns {TaskTreeModel[]}
         */
        extractTasks(){
            let tasks = []
            this.vertex.machineTreeModelList.forEach(machine => {
                tasks = tasks.concat(machine.taskTreeModelList)
            })
            return tasks;
        },
        clickExtend(){
            this.vertex.extend = !this.vertex.extend
            if(this.vertex.extend && this.vertex.machineTreeModelList != undefined){
                this.vertex.config.height = d3.sum(this.vertex.machineTreeModelList, d => d.config.height) + this.vertex.config.unitHeight
            }else {
                this.vertex.config.height = + this.vertex.config.unitHeight
            }
            this.$store.commit('comparison/updateTaskListHighlight', this.app);
        },
        clickDetails(){
            this.vertex.detail = !this.vertex.detail
            if(this.vertex.extend && this.vertex.machineTreeModelList != undefined){
                this.vertex.config.height = d3.sum(this.vertex.machineTreeModelList, d=>d.config.height) + this.vertex.config.unitHeight
            }else {
                this.vertex.config.height = this.vertex.config.unitHeight
            }
        },
        mouseenter() {
            this.$store.commit('comparison/changeHighlightVertex', {
                app: this.app,
                vertex: this.vertex._mainObj,
                toHighlight: true,
            });
            this.vertexHover = true;
        },
        mouseleave() {
            this.$store.commit('comparison/changeHighlightVertex', {
                app: this.app,
                vertex: this.vertex._mainObj,
                toHighlight: false,
            });
            this.vertexHover = false;
        },
    },
    watch: {
        totalHeight(){
            console.log('total height changed', this.vertex.config.height)
            this.vertex.config.height = this.totalHeight + this.vertex.config.unitHeight
        },
        outerSelect() {
            if (this.outerSelect && !this.vertex.extend) {
                this.clickExtend();
            }
        },
        outlierBound(){
          // console.log(this.outlierBound, Math.ceil(this.vertex.tasks.length * (1 - this.outlierBound)))
          this.targetOutlierTasksNum = Math.ceil(this.vertex.tasks.length * (1 - this.outlierBound))
        }
    },
    computed: {
        ...mapState('comparison', {
            colorSchema: state => state.colorSchema,
        }),
        isRenderColor(){
          return this.appendCtxType === "DataLayout"
        },
        outerSelect() {
            return this.vertex.config.outerSelect;
        },
        currentStroke(){
            if (this.vertex.interact.highlightMode !== HighlightMode.NONE) {
                switch (this.vertex.interact.highlightMode) {
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
            if(this.outerSelect || this.vertex.interact.highlightMode !== HighlightMode.NONE){
                return '1.5'
            }
            return '0.3'
        },
        strokeColor(){
            return 'grey'
        },
        generateTriangle(){
            let length = 12
            let width = 10
            const l1 = 5
            const t1 = (this.vertex.config.unitHeight - length) / 2
            const l2 = l1 - 2
            const t2 = (this.vertex.config.unitHeight - width) / 2
            if(!this.vertex.extend) {
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
            return this.vertex.config.height
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
            return this.vertex.machineTreeModelList;
        },
        totalHeight(){
            if(this.vertex.machineTreeModelList){
                return d3.sum(this.vertex.machineTreeModelList, d=>d.config.height)
            }else{
                return this.vertex.config.height
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
