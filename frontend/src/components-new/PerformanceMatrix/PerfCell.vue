<template>
    <g @mouseover="mouseover" @mouseout="mouseout" @click="cellClick">
        <rect :x="boundary" :y="boundary"
              :width="colWidth-boundary*2" :height="rowHeight-boundary*2"
              :stroke="currentStroke" :stroke-width="strokeWidth"
              fill="black" :fill-opacity="fillOpacity" rx="2"></rect>
        <g :transform="'translate(' + [colWidth / 2, rowHeight / 2] + ')'">
            <path v-for="(pathObj, index) in pathList" :key="index"
                  :fill="pathObj.stroke" stroke="white" stroke-width="0.5"
                  :d="pathObj.path"></path>
            <circle :cx="0" :cy="0" :r="colWidth / 2 * 0.8"
                    fill-opacity="0" stroke="steelblue" stroke-width="0.5">
            </circle>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3";
import {mapState} from "vuex";
import {HighlightMode} from "@/utils/const/HightlightMode";
// TODO: 需要重构一下，把piechart抽离出来
// TODO: score 的计算最好也能函数话，分为考虑impact和不考虑impact两类
export default {
    name: "PerfCell",
    props: ['vecName', 'colWidth', 'rowHeight', 'data', 'app', 'vertexNameMap','machineId', "diagnoseParamMatrix","perShowList"],
    data(){
        return {
            boundary: 1,
            pathListRender : null,
            hover: false,
        }
    },
    computed:{
        pathList(){
          return this.generatePathList()
        },
        fillOpacity(){
            return this.data ? this.data.vertex_impact * 0.9: 0
        },

        ...mapState('comparison', {
            colorSchema: state => state.colorSchema,
        }),
        vertex() {
            return this.vertexNameMap.get(this.vecName);
        },
        machine() {
            return this.app.machineMap.get(this.machineId);
        },
        currentStroke(){
            if (this.vertex.interact.highlightMode !== HighlightMode.NONE
                    && (!this.machine || this.machine.vidSet.has(this.vertex.vid))) {
                switch (this.vertex.interact.highlightMode) {
                    case HighlightMode.CURRENT: {
                        const testTask = this.app.onlyOneHighlightTask
                        if (testTask && testTask.machine) {
                            if (testTask.vertex.vertexName === this.vecName
                                    && testTask.machine.machineName === this.machineId) {
                                return this.colorSchema['highlightAsCurrent'];
                            } else if (!testTask.machine) {
                                return this.machine ? this.colorSchema['highlightAsCurrent'] : 'grey';
                            } else {
                                return 'grey';
                            }
                        } else {
                            return this.colorSchema['highlightAsCurrent'];
                        }
                    }
                    case HighlightMode.PROVIDER: return this.colorSchema['highlightAsProvider'];
                    case HighlightMode.CONSUMER: return this.colorSchema['highlightAsConsumer'];
                }
            }
            if (this.hover) {
                return 'purple'
            }
            return 'grey'
        },
        strokeWidth(){
            if (this.currentStroke !== 'grey'){
                return '2'
            }
            return '0.5'
        },
    },
    watch:{
      perShowList(){
        this.pathListRender = this.generatePathList()
      }
    },
    methods:{
        getR(feature){
            return this.data[feature]* (this.colWidth / 2 * 0.8)
        },
        getDurationScore(){
            if(this.data){
                return this.data.duration
            }else{
                return 0
            }
        },
        mouseover(){
            this.enterNode(this.vertexNameMap.get(this.vecName));
            this.hover = true;
        },
        mouseout(){
            this.leaveNode(this.vertexNameMap.get(this.vecName))
            this.hover = false;
        },
        enterNode(vertex) {
            this.$store.commit('comparison/changeHighlightVertex', {
                app: this.app,
                vertex: vertex,
                toHighlight: true,
            });
            this.app.onlyOneHighlightTask = {vertex: this.vertex, machine: this.machine};
            // //TODO:直接copy过来，需要封装起来
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: node.data.vertexIdList,
            //     type: 'selectCurrent',
            //     value: true,
            // })
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: node.inEdges.map(e => e.src.data.vertexIdList).flat(),
            //     type: 'selectAsProvider',
            //     value: true,
            // })
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: node.outEdges.map(e => e.dst.data.vertexIdList).flat(),
            //     type: 'selectAsConsumer',
            //     value: true,
            // })
            // let maxDuration = 0
            // node.data.vertexIdList.forEach(vertexName => {
            //     const vertex = this.app.vertexNameMap.get(vertexName);
            //     const selecteTaskdList = []
            //     vertex.tasks.forEach(task => {
            //         task.layout.selectCurrent = true
            //         selecteTaskdList.push(task)
            //     })
            //     maxDuration = Math.max(maxDuration, d3.max(vertex.tasks, t => t.end - t.start))
            //     //  highlight in TaskMatrix
            //     this.app.interactiveModule.selectedTasks = selecteTaskdList
            // })
            // this.app.matrixRefDuration = maxDuration
        },
        leaveNode(vertex) {
            this.$store.commit('comparison/changeHighlightVertex', {
                app: this.app,
                vertex: vertex,
                toHighlight: false,
            });
            this.app.onlyOneHighlightTask = null;
            // //TODO:直接copy过来，需要封装起来
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: node.data.vertexIdList,
            //     type: 'selectCurrent',
            //     value: false,
            // })
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: node.inEdges.map(e => e.src.data.vertexIdList).flat(),
            //     type: 'selectAsProvider',
            //     value: false,
            // })
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: node.outEdges.map(e => e.dst.data.vertexIdList).flat(),
            //     type: 'selectAsConsumer',
            //     value: false,
            // })
            // node.data.vertexIdList.forEach(vertexName => {
            //     const vertex = this.app.vertexNameMap.get(vertexName);
            //     vertex.tasks.forEach(task => task.interact.highlightMode = HighlightMode.NONE);
            // })
            // this.app.matrixRefDuration = null
            // // remove selected tasks
            // this.app.interactiveModule.selectedTasks = []
        },

        cellClick(){
          // if (this.machineId === undefined){
          //   this.$store.commit("comparison/changeAppShowingTaskOverviewMatrix")
          // }else{
          //   this.$store.commit("comparison/changeAppShowingTaskSelectedMachine", this.machineId)
          // }
        },

        generatePathList(){
          if(this.data){
            // let score = this.data['duration_score'];
            // let scoreOutR = score* (this.colWidth / 2 * 0.8)
            //
            // let diagnoseColorList = ["#33a02c","#e31a1c","#9100ff", "#f5f228",
            //   "#1f78b4", "#2ad5ec", "#f6aad6"]
            let diagnoseList = []
            let diagnoseNameList = []
            let showCnt = 0

            for (let name in this.perShowList){
              const info = this.perShowList[name]
              if (info){
                diagnoseNameList.push(name)
                showCnt += 1
              }
            }

            let startAngel = -1 * Math.PI / 180 * 180;
            let endAngel =startAngel + Math.PI / 180 * (360 / showCnt);

            for (let i =0; i <showCnt; i ++){
              diagnoseList.push({
                path:d3.arc()
                    .innerRadius(0)
                    // .outerRadius(this.data[vec].duration_score)
                    .outerRadius(this.getR(diagnoseNameList[i]))
                    .startAngle(startAngel)
                    .endAngle(endAngel)(),
                stroke: this.diagnoseParamMatrix[diagnoseNameList[i]].color
              })
              startAngel = endAngel
              endAngel = endAngel + Math.PI / 180 * (360 / showCnt)
            }
            return diagnoseList
            // return [
            //
            //     {
            //         path:d3.arc()
            //             .innerRadius(0)
            //             // .outerRadius(this.data[vec].duration_score)
            //             .outerRadius(scoreOutR)
            //             .startAngle(-1 * Math.PI / 180 * 60)
            //             .endAngle(-1 * Math.PI / 180 * 0)(),
            //         stroke: "#33a02c"
            //     },{
            //         path: d3.arc()
            //             .innerRadius(0)
            //             // .outerRadius(this.data[vec].duration_score)
            //             .outerRadius(this.getR('parallel_score') * this.data.vertex_impact)
            //             .startAngle(0)
            //             .endAngle(Math.PI / 180 * 60)(),
            //         stroke: "#e31a1c"
            //     },{
            //         path: d3.arc()
            //             .innerRadius(0)
            //             // .outerRadius(this.data[vec].duration_score)
            //             .outerRadius(this.getR('step_duration_score_0') * this.data.vertex_impact)
            //             .startAngle(Math.PI / 180 * 60)
            //             .endAngle(Math.PI / 180 * 120)(),
            //         stroke: "#1f78b4"
            //     },
            //     {
            //       path: d3.arc()
            //           .innerRadius(0)
            //         // .outerRadius(this.data[vec].duration_score)
            //           .outerRadius(this.getR('step_duration_score_0') * this.data.vertex_impact)
            //           .startAngle(Math.PI / 180 * 120)
            //           .endAngle(Math.PI / 180 * 180)(),
            //       stroke: "#1f78b4"
            //   }
            // ]
          }else{
            return []
          }
        }
    },
    created() {
      this.pathListRender = this.generatePathList()
    }
}
</script>

<style scoped>

</style>
