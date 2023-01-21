<template>
    <div>
        <div style="margin-top: 4px">
            <el-select v-model="orderByValue" placeholder="Order by" size="mini" style="margin-right: 10px">
                <div>
                    <el-option
                            v-for="(item, idx) in options"
                            :key="idx"
                            :label="item"
                            :value="idx">
                    </el-option>
                </div>
            </el-select>
            <el-radio-group v-model="order" size="mini">
                <el-radio-button icon="el-icon-bottom" label="down"><i class="el-icon-sort-down"></i></el-radio-button>
                <el-radio-button icon="el-icon-top" label="up"><i class="el-icon-sort-up"></i></el-radio-button>
            </el-radio-group>
        </div>
        <svg class="taskView" :style="'width: 100%; height: ' + expandedHeight * taskList.length + 'px'">
            <g class="container" transform="translate(0, 10)">

                <TaskLine v-for="(task) in taskList" :key="task.task_id"
                          :transform="'translate(' + [0, task.taskViewConfig.y] + ')'"
                          :unitHeight="unitHeight - unitGap"
                          :height="unitHeight"
                          :width="width"
                          :timeScale="timeScale"
                          :xScale="xScale"
                          :task="task"
                          :expandedHeight="expandedHeight - unitGap"
                          :rhHeight="rhHeight"
                          :outliers="outlierData[task.vec_name]"
                          :expanded="task.taskViewConfig.expanded"
                          @clickLineGlyph="clickLineGlyph"
                ></TaskLine>

            </g>
        </svg>
    </div>
</template>

<script>
import * as d3 from "d3";
import {mapGetters, mapState} from "vuex";
import TaskLine from "@/components/Task/TaskLine";
// import TweenLite from "gsap";

export default {
    name: "TaskView",
    data(){
        return {
            unitHeight: 20,
            unitGap: 8,
            expandedHeight: 160,
            rhHeight: 60,
            width: 10,
            timeScale: undefined,
            xScale: undefined,
            taskList:[],

            // interaction

            order: 'down',
            options: ['Total time', 'Initialization time', 'Input/Shuffle time',
                'Process time', 'Sink time', 'Spill/Output time',
                'Input bytes', 'Output bytes', 'Shuffle bytes'],        // 6 7 8
            orderByValue: 0
        }
    },
    methods: {
        clickLineGlyph (taskId) {
            let i = 0, iLen = this.taskList.length
            while (i < iLen && this.taskList[i].task_id !== taskId) {i++}
            let expandedNew = !this.taskList[i].taskViewConfig.expanded
            this.taskList[i].taskViewConfig.expanded = expandedNew
            let offset = (expandedNew ? 1 : -1) * (this.expandedHeight - this.unitHeight)
            for (i += 1; i < iLen; i++) {
                this.taskList[i].taskViewConfig.y += offset
            }
            this.taskList = [...this.taskList]
        },
        computeTaskLines() {
            this.timeScale = d3.scaleLinear().domain([0, this.maxTimeLength]).range([0, this.width - this.unitHeight*2.5]);
            this.xScale = d3.scaleLinear().domain([this.minTime, this.maxTime]).range([0, this.width - this.unitHeight*2.5]);

            let cmp
            if (this.orderByValue === 0) {
                cmp = (task => task.end_time - task.start_time)
            } else if (this.orderByValue >= 1 && this.orderByValue <= 5) {
                cmp = (task => task.step_info[this.orderByValue * 2 - 1] - task.step_info[this.orderByValue * 2 - 2])
            } else if (this.orderByValue >= 6 && this.orderByValue <= 8) {
                let name = ['INPUT_SPLIT_LENGTH_BYTES', 'OUTPUT_BYTES', 'SHUFFLE_BYTES'][this.orderByValue - 6]
                cmp = (task => this.counters[task.task_id][name])
            }

            // console.log(this.selectTaskList.map(task => task.step_info))
            let reverse = this.order === 'up' ? -1 : 1
            let list = this.selectTaskList.sort((t1, t2) => reverse * (cmp(t2) - cmp(t1)));
            let newList = [];
            for(let i = 0, ilen = Math.min(100, list.length); i<ilen; i++){
                newList.push(list[i])
            }
            newList.forEach((task, i)=>{
                if(task.taskViewConfig == undefined){
                    task.taskViewConfig = {y:800, expanded:false}
                }
                let taskViewConfig = {
                    'y': i * this.unitHeight,
                    expanded: false,
                }
                task.taskViewConfig = taskViewConfig;
                // list[i].taskViewConfig = taskViewConfig;
                // TweenLite.to(task.taskViewConfig, 200/ 1000, taskViewConfig)
            })
            this.taskList = newList;
        }
    },
    watch:{
        renderSign() {
            this.computeTaskLines()
        },
        order() {
            this.computeTaskLines()
        },
        orderByValue() {
            this.computeTaskLines()
        }
    },
    components:{
        TaskLine
    },
    mounted(){
        let rect = d3.select(".taskView").node().getBoundingClientRect();
        this.width= rect.width;
    },
    computed: {
        ...mapState('simulation', {
            // taskList: state => {
            //     function sortNumber(a,b)
            //     {
            //         return (b.end_time - b.start_time) - (a.end_time - a.start_time);
            //     }
            //     let list = state.selectTaskList.sort(sortNumber), newList = [];
            //     for(let i = 0, ilen = Math.min(100, list.length); i<ilen; i++){
            //         list.taskViewConfig = {
            //             'y': i * this.unitHeight
            //         }
            //         newList.push(list[i])
            //     }
            //     return newList
            // },
            selectTaskListOrigin: state=>state.selectTaskList,
            outlierData: state => state.outlierData,
            renderSign: state => state.renderSign,
            maxTime: state => state.maxTime,
            minTime: state => state.minTime,
            minTimeLength: state => state.minTimeLength,
            maxTimeLength: state => state.maxTimeLength,
            vMaxTime: state => state.vMaxTime,
            counters: state => state.counters,
        }),
        ...mapGetters('simulation', {
            simRunning: 'running',
        }),
        selectTaskList() {
            return [...this.selectTaskListOrigin]
        }
    }
}
</script>

<style scoped>

</style>
