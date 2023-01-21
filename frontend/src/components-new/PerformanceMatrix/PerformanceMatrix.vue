<template>
  <div>
    <svg :height="height" class="container">
        <g class="vec" :transform="vecTitleTransform">
            <g v-for="(headName, index) in vecNameList" :key="index" :transform="'translate(' + [index * colWidth + colWidth / 2, UB] + ')'">
                <!--                <circle :cx="0" cy="0" r="2" fill="green"></circle>-->
                <text style="font-size:10px; user-select: none;"
                      y="-5" x="2" transform="rotate(-45)">{{getShortNodeLabel(headName)}}</text>
            </g>
        </g>
      <g class="machine" :transform="machineIdTransform">
        <svg x=22 y=-25 @click="showOverviewClick"
             t="1636910850992" class="icon" viewBox="0 0 1024 1024" v   ersion="1.1"
             xmlns="http://www.w3.org/2000/svg" p-id="562" width="20" height="20">
            <rect x="0" y="0" fill="#ffffff" width="1024" height="1024"/>
            <path v-if="app.showOverviewMatrix" :fill="'#231815'"
                  d="M823.1 945.3H204c-67.6 0-122.7-55-122.7-122.7V203.5c0-67.6 55-122.7 122.7-122.7h619.1c67.6 0 122.7 55 122.7 122.7v619.1c0 67.7-55.1 122.7-122.7 122.7zM204 138.2c-36 0-65.4 29.3-65.4 65.4v619.1c0 36 29.3 65.4 65.4 65.4h619.1c36 0 65.4-29.3 65.4-65.4V203.5c0-36-29.3-65.4-65.4-65.4H204z M438.2 707.2h-0.5c-8.5-0.1-16.6-3.7-22.5-9.9L235.3 508.8c-12.1-12.7-11.7-32.9 1.1-45 12.7-12.1 32.9-11.7 45 1.1L439 630l307.5-301.9c12.5-12.3 32.7-12.1 45 0.4 12.3 12.5 12.1 32.7-0.4 45L460.5 698.1c-5.9 5.8-14 9.1-22.3 9.1z" p-id="563"></path>
            <path v-else :fill="'#231815'"
                  d="M823.1 945.3H204c-67.6 0-122.7-55-122.7-122.7V203.5c0-67.6 55-122.7 122.7-122.7h619.1c67.6 0 122.7 55 122.7 122.7v619.1c0 67.7-55.1 122.7-122.7 122.7zM204 138.2c-36 0-65.4 29.3-65.4 65.4v619.1c0 36 29.3 65.4 65.4 65.4h619.1c36 0 65.4-29.3 65.4-65.4V203.5c0-36-29.3-65.4-65.4-65.4H204z" p-id="1105"></path>
        </svg>
      </g>
        <g :transform="vecContextTransform">
            <PerMachineRow
                    :colWidth="colWidth"
                    :rowHeight="rowHeight"
                    :vecNameList="vecNameList"
                    :data="vecPerObj"
                    :vertexNameMap="vertexNameMap"
                    :app="app"
                    :diagnoseParamMatrix="diagnoseParamMatrix"
                    :perShowList="perShowListRender"
            ></PerMachineRow>
        </g>
        <g class="machine" :transform="machineIdTransform">
            <g v-for="(headName, index) in machineIdList" :key="index" :transform="'translate(' + [0, index * rowHeight + rowHeight / 2] + ')'">
                <text x=3 y=3 style="font-size:10px; user-select: none;" >{{headName}}</text>
                <svg x=32 y=-8 @click="showClick(headName)"
                     t="1636910850992" class="icon" viewBox="0 0 1024 1024" version="1.1"
                     xmlns="http://www.w3.org/2000/svg" p-id="562" width="18" height="18">
                    <rect x="0" y="0" fill="#ffffff" width="1024" height="1024"/>
                    <path v-if="toShowMachineMatrix(headName)" :fill="'#231815'"
                          d="M823.1 945.3H204c-67.6 0-122.7-55-122.7-122.7V203.5c0-67.6 55-122.7 122.7-122.7h619.1c67.6 0 122.7 55 122.7 122.7v619.1c0 67.7-55.1 122.7-122.7 122.7zM204 138.2c-36 0-65.4 29.3-65.4 65.4v619.1c0 36 29.3 65.4 65.4 65.4h619.1c36 0 65.4-29.3 65.4-65.4V203.5c0-36-29.3-65.4-65.4-65.4H204z M438.2 707.2h-0.5c-8.5-0.1-16.6-3.7-22.5-9.9L235.3 508.8c-12.1-12.7-11.7-32.9 1.1-45 12.7-12.1 32.9-11.7 45 1.1L439 630l307.5-301.9c12.5-12.3 32.7-12.1 45 0.4 12.3 12.5 12.1 32.7-0.4 45L460.5 698.1c-5.9 5.8-14 9.1-22.3 9.1z" p-id="563"></path>
                    <path v-else :fill="'#231815'"
                          d="M823.1 945.3H204c-67.6 0-122.7-55-122.7-122.7V203.5c0-67.6 55-122.7 122.7-122.7h619.1c67.6 0 122.7 55 122.7 122.7v619.1c0 67.7-55.1 122.7-122.7 122.7zM204 138.2c-36 0-65.4 29.3-65.4 65.4v619.1c0 36 29.3 65.4 65.4 65.4h619.1c36 0 65.4-29.3 65.4-65.4V203.5c0-36-29.3-65.4-65.4-65.4H204z" p-id="1105"></path>
                </svg>
            </g>
        </g>
      <g class="context" :transform="machineVecTransform">
            <g v-for="(machine, index) in perMatrix" :key="machine.machine_id">
                <PerMachineRow
                        :colWidth="colWidth"
                        :rowHeight="rowHeight"
                        :vecNameList="vecNameList"
                        :data="machine"
                        :app="app"
                        :vertexNameMap="vertexNameMap"
                        :machineId="machineIdList[index]"
                        :diagnoseParamMatrix="diagnoseParamMatrix"
                        :perShowList="perShowListRender"
                        :transform="'translate(' + [0, index * rowHeight] + ')'"></PerMachineRow>
            </g>
        </g>
    </svg>
    <div>
        <el-checkbox-group class="checkbox-group" :fill="'#999999'"
                           v-model="perShowList" size="mini">
            <el-checkbox-button label="duration_score">Duration</el-checkbox-button>
            <el-checkbox-button label="parallel_score">Parallelism</el-checkbox-button>
            <el-checkbox-button label="step_duration_score_0">Initialization</el-checkbox-button>
            <el-checkbox-button label="step_duration_score_1">Input/Shuffle</el-checkbox-button>
            <el-checkbox-button label="step_duration_score_2">Processor</el-checkbox-button>
            <el-checkbox-button label="step_duration_score_3">Sink</el-checkbox-button>
            <el-checkbox-button label="step_duration_score_4">Spill/Output</el-checkbox-button>
        </el-checkbox-group>

    </div>
  </div>
</template>

<script>
// import * as d3 from "d3";
import PerMachineRow from "@/components-new/PerformanceMatrix/PefMachineRow";
import {mapState} from "vuex";

export default {
    name: "PerformanceMatrix",
    components: {PerMachineRow},
    props: ['app'],
    data(){
        return {
            UB: 45,
            LB: 50,
            rowHeight: 35,
            colWidth: 35,
            containerWidth: 0,
            totalHeight:450,
            perShowList: [
                'duration_score',
                'parallel_score',
                'step_duration_score_0',
                'step_duration_score_1',
                'step_duration_score_2',
                'step_duration_score_3',
                'step_duration_score_4',
            ],
        }
    },
    computed: {
        ...mapState("comparison",{
          // selectedMachineMetrics: state=>state.appShowingTask.selectedMachineMetrics,
          // overviewMatrix:state=>state.appShowingTask.overviewMatrix,
          layoutConfig:state=>state.layoutConfig
        }),

      perShowListRender(){
          return {
            "duration_score" : this.perShowList.indexOf('duration_score') !== -1,
            "parallel_score" : this.perShowList.indexOf('parallel_score') !== -1,
            "step_duration_score_0" : this.perShowList.indexOf('step_duration_score_0') !== -1,
            "step_duration_score_1" : this.perShowList.indexOf('step_duration_score_1') !== -1,
            "step_duration_score_2" : this.perShowList.indexOf('step_duration_score_2') !== -1,
            "step_duration_score_3" : this.perShowList.indexOf('step_duration_score_3') !== -1,
            "step_duration_score_4" : this.perShowList.indexOf('step_duration_score_4') !== -1,
          }
      },
      diagnoseParamMatrix(){
        return {
          "duration_score":{
            'color': "#33a02c",
          },
          "parallel_score":{
            'color': "#e31a1c",
          },
          "step_duration_score_0":{
            'color': this.layoutConfig.stepColors[0],
          },
          "step_duration_score_1":{
            'color': this.layoutConfig.stepColors[1],
          },
          "step_duration_score_2":{
            'color': this.layoutConfig.stepColors[2],
          },
          "step_duration_score_3":{
            'color': this.layoutConfig.stepColors[3],
          },
          "step_duration_score_4":{
            'color': this.layoutConfig.stepColors[4],
          },
        }
      },

      vertexNameMap(){
            const vertexNameMap = new Map();
            this.app.vertexes.forEach(v => {
                vertexNameMap.set(v.vertexName, v);
            })
            return vertexNameMap;
        },
        height(){
            return this.UB + this.rowHeight * (this.perMatrix.length + 1) + 20
        },
        machineIdList(){
            return [...new Set(this.vecMachineList.map(d=>d.machine_id))]
        },
        vecNameList(){
            return [...new Set(this.vecMachineList.map(d=>d.vec_name))]
        },
        vecMachineList(){
            return this.app.diagnoseData.vec_machine_df
        },
        perMatrix() {
            let machineVecDict = {}
            this.vecMachineList.forEach(d=>{
                if(!machineVecDict[d.machine_id]) machineVecDict[d.machine_id] = {machine_id:d.machine_id}
                if(!machineVecDict[d.machine_id][d.vec_name])
                    machineVecDict[d.machine_id][d.vec_name] = {}
                machineVecDict[d.machine_id][d.vec_name] = d
            })
            return Object.values(machineVecDict)
        },
        vecList(){
            return this.app.diagnoseData.vec_df
        },
        vecPerObj(){
            let vecMap = {}
            this.vecList.forEach(vec=>{
                vecMap[vec.vec_name] = vec
            })
            return vecMap
        },
        vecTitleTransform(){
            return "translate(" + [this.LB, 0] + ')'
        },
        vecContextTransform(){
            return "translate(" + [this.LB, this.UB] + ')'
        },
        machineIdTransform(){
            return "translate(" + [0, this.UB+this.rowHeight + 5] + ')'
        },
        machineVecTransform(){
            return "translate(" + [this.LB, this.UB + this.rowHeight + 5] + ')'
        },
    },
    watch:{
      // perShowList(){
      // },
      // perShowListRender(){
      //   // alert(4)
      // }
  },
    mounted(){
        this.containerWidth = this.$el.clientWidth
        let rowWidth = this.containerWidth - this.LB * 1.5
        this.colWidth = Math.min(rowWidth / this.vecNameList.length, this.rowHeight)
        this.rowHeight = this.colWidth
    },
    methods:{
      showClick(machineName){
        if (this.app.selectedMachines.includes(machineName)) {
            this.app.selectedMachines.splice(this.app.selectedMachines.indexOf(machineName), 1);
        } else {
            this.app.selectedMachines.push(machineName);
        }
      },
        getShortNodeLabel(vertexName) {
            return vertexName.charAt(0) + vertexName.match(/.* (\d*)/)[1];
        },
    toShowMachineMatrix(machineName) {
        return this.app.selectedMachines.includes(machineName);
    },
      showOverviewClick(){
          this.app.showOverviewMatrix ^= true;
      },
    }
}
</script>

<style scoped>
.container {
  border-style: solid;
  border-color: #d9d8d8;
  border-width: 0.2px;
  border-radius: 3px;

  margin-left: 4px;

  width: 100%;
  /*height: calc(50% - 12px);*/
}

.checkbox-group >>> .el-checkbox-button__inner {
    padding: 4px 6px;
    font-size: 11px;
}

.checkbox-group {
    float: right;
    margin: 0 -5px 10px 0;
}
</style>
