<template>
    <div style="padding-right: 5px;">
        <el-row v-if="finishLoading">
          <el-col v-if="value === 'Duration'" :span="13">
            <el-select size="mini"
                       style="margin-top: 5px; margin-left: 18px; width: 180px; float: left;"
                       v-model="value" placeholder="Please select">
                <el-option
                        v-for="item in options"
                        :key="item"
                        :label="item"
                        :value="item">
                </el-option>
            </el-select>
          </el-col>
          <el-col v-if="value !== 'Duration'" :span="6">
            <el-select size="mini"
                       style="margin-top: 5px; margin-left: 18px; width: 120px; float: left;"
                       v-model="value" placeholder="Please select">
              <el-option
                  v-for="item in options"
                  :key="item"
                  :label="item"
                  :value="item">
              </el-option>
            </el-select>
          </el-col>
          <el-col v-if="value !== 'Duration'" :span="6">
            <el-select size="mini"
                       style="margin-top: 5px; margin-left: 60px; width: 120px; float: left;"
                       v-model="value2" placeholder="Please select">
              <el-option
                  v-for="item in options2"
                  :key="item"
                  :label="item"
                  :value="item">
              </el-option>
            </el-select>
          </el-col>
          <el-col v-if="value !== 'Duration'" :span="5" :offset="7" class="slider">
<!--            Outlier Controller-->
            <el-slider
                       v-model="outlierBound" :step="10" :min="0" :max="100" :format-tooltip="formatTooltip"></el-slider>
          </el-col>
        </el-row>
        <svg v-if="treeModel && renderComponent" :height="totalHeight + 80" style="margin-top: 5px; width: 100%">
            <g class="content" transform="translate(20, 0)">
                <g v-for="(vertex, index) in vertexList" :key="vertex.vid" style="padding-right: 10px;">
                    <VertexRow :app="app"
                               :vertex="vertex"
                               :index="index"
                               :start="startTime"
                               :end="endTime"
                               :widthRatio="widthRatio"
                               :columns="columns"
                               :width="width - 28"
                               :machineNames="machineNames"
                               :taskNum="taskNum"
                               :maxDuration="maxDuration"
                               :brothers="vertexList"
                               :headConfig="headConfig"
                               :srcNestMap="srcNestMap"
                               :dstNestMap="dstNestMap"
                               :timeScale="timeScale"
                               :contextType="value"
                               :appendCtxType="value2"
                               :outlierBound="outlierBound / 100"
                    ></VertexRow>
<!--                  :dataLayoutTasks="vertexTasksMap.get(vertex.vertexName)"-->

                </g>
            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import {mapState} from "vuex"
import VertexRow from './TaskNew/VertexRow'

export default {
    name: "TaskView",
    components:{
        VertexRow
    },
    data(){
        const _columns = ['vertex', 'machine', 'task', 'start', 'end', 'duration', 'step']
        const _ratio = Array(_columns.length).fill(1 / _columns.length)
        const unitHeight = 25
        const timeScale = d3.scaleLinear().domain([this.start, this.end])
        return {
            vertexList: [],
            unitHeight: unitHeight,
            detailHeight: 80,
            timeScale: timeScale,
            width: 0,
            widthRatio: _ratio,
            columns: _columns,
            startTime: Number.MAX_VALUE,
            endTime: Number.MIN_VALUE,
            maxDuration: 0,
            machineNames: [],
            pageHeight: 100,
            headConfig: {
                unitHeight: unitHeight,
                contextFill: 'white',
                strokeWidth: 0.3
            },
            renderComponent: true,
            taskNum: 0,
            srcNestMap: {},
            dstNestMap: {},
            headLength: 40,
            marginY: 3,
            textMarginY: 19,
            strokeColor: 'grey',
            machineSize:0,
            values: undefined,
            dataCounters: undefined,
            options: ['Duration', 'TimeUsage'],
            value: 'Duration',

            value2: 'Select Opinions',
            outlierBound: 0,
            options2:['No Second Metric','DataLayout']
        }
    },
    methods: {
        formatTooltip(val){
          return val + "%"
        },
        recomputeSize() {

        },
        sum(arr){
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
        forceRerender() {
            // Remove my-component from the DOM
            this.renderComponent = false;

            this.$nextTick(() => {
                // Add the component back in
                this.renderComponent = true;
            });
        },
        dragFunc(index){
            // let i = 0
            const dragstarted = () => {
                console.log('drag start')
            }

            const dragged = () => {
                const a = d3.event.x / this.width - this.sum(this.widthRatio.slice(0, index - 1))
                const b = this.sum(this.widthRatio.slice(0, index + 1)) - d3.event.x / this.width
                this.widthRatio[index-1] = a
                this.widthRatio[index] = b
            }

            const dragended = () => {
                console.log('drag end')
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        },
        updateSelectOptions() {
            this.options = ['Duration', 'TimeUsage']
            if (this.app) {
                this.app.counterKeys.forEach(val=>{
                    this.options.push(val)
                })
            }
        }
    },
    watch:{
        fetchData(){
            // TODO: nest for fetch data
            const nestArray = d3.nest().key(d=>d.src).entries(this.fetchData).filter(d=>d.key!="undefined")
            const srcNestMap = d3.map(nestArray, d=>d.key)
            const dstNestMap = d3.map(d3.nest().key(d=>d.dst).entries(this.fetchData), d=>d.key)
            this.srcNestMap = srcNestMap
            this.dstNestMap = dstNestMap
            console.log('nest Array', nestArray)
            console.log('srcNestMap', srcNestMap)
            console.log('dstNestMap', dstNestMap)
        },

        taskListRenderSign() {
            this.updateSelectOptions();

            this.taskNum = this.taskListAll?.length ?? 0
            this.machineNames = this.app?.machines?.map(m => m.machineName) ?? [];

            this.vertexList = this.app?.treeModel?.vertexTreeModelList ?? [];
            this.values = this.taskListAll
            this.startTime = 0
            this.endTime = this.app?.duration ?? 0;
            this.maxDuration = d3.max(this.taskListAll, d => d.end - d.start)
            this.timeScale.domain([this.startTime, this.endTime])
            this.forceRerender()
        }
    },
    mounted(){
        this.width = this.$el.clientWidth
        const _this = this
        d3.selectAll('.dragComponents').each(function(_, i){
            d3.select(this).call(_this.dragFunc(i))
        })
        this.machineSize = this.unitHeight - this.marginY * 2 - 4 * 2
    },
    computed: {
        ...mapState('comparison', {
            // finishLoading: state => !state.inLoading,
            app: state => state.appShowingTask,
        }),
        appendCtxType(){
          return this.app?.appendCtxType;
        },
        treeModel() {
            return this.app?.treeModel;
        },
        taskListRenderSign() {
            return this.app?.signs.taskListSign;
        },
        finishLoading() {
            return this.app != null;
        },
        taskListAll() {
            return this.app?.tasks ?? [];
        },
        recordMap() {
            return this.app?.recordMap ?? new Map();
        },

        taskLength() {
            return this.taskListAll?.length ?? 0;
        },
        totalHeight(){
            return d3.sum(this.vertexList, vertex => vertex.config.height)
        },
    }
}
</script>

<style scoped>
.checkbox-group >>> .el-radio-button__inner {
    padding: 6px 12px;
    font-size: 12px;
}

.checkbox-group {
    margin-top: 10px;
    width: 200px;
}
/deep/ .el-slider__bar{
  background: rgb(108, 109, 111);
}
/deep/ .el-slider__button{
  width: 7px;
  height: 7px;
  border:2px solid grey;
}
/deep/ .el-slider__runway{
  height: 4px;
}
</style>
