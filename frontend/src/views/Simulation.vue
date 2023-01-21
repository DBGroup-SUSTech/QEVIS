<template>
  <div class="container">
    <ul class="nav2">
      <el-row>
        <el-col :span="4">
          <li class="titletext">Query Execution Analysis</li>
        </el-col>
        <el-col :span="8">
          <div>
            <el-select
                style="margin-left: 10px; margin-top: 8px"
                v-model="curAid" placeholder="Select data" size="mini">
              <el-option
                  v-for="appMeta in appMetaList"
                  :key="appMeta.aid"
                  :label="appMeta.query_name"
                  :value="appMeta.aid">
              </el-option>
            </el-select>

            <el-button style="margin-top: 8px; margin-left: 10px" :disabled="curAid === null"
                       v-on:click="simulationClick" size="mini"
                       :icon="inLoading ? 'el-icon-loading' : 'el-icon-s-marketing'"/>
            <el-switch
                style="margin-left: 10px"
                v-model="showCompound"
                active-text="compound graph">
            </el-switch>
          </div>
        </el-col>
      </el-row>
    </ul>
    <div id="simulation">
      <el-row style="height:100%;">
<!--        <el-col style="height:100%;" :span="7"></el-col>-->

<!--        <el-col :span="10" style="height: 100%;" class="boundary">-->
<!--        </el-col>-->

<!--        <el-col :span="7" style="height: 100%;" class="boundary"></el-col>-->


        <el-col v-if="true" style="height:100%;" :span="7">
          <el-row style="width:100%; height: 35%"  class="boundary">
            <div class="mini_head">
                  <div class='mini_title'>Execution Plan</div>
            </div>
                <DAGDiagram v-if="app !== null"
                            style="width: 100%; height: calc(100% - 30px);" :app="app"/>
          </el-row>
          <el-row style="width:100%; height: 65%; overflow-y: scroll;">
            <div class="mini_head">
              <div class='mini_title'>Task List</div>
            </div>
            <TaskListNew style="width: 100%"
                         v-if="app !== null"></TaskListNew>
          </el-row>
        </el-col>

        <el-col :span="11" class="boundary">
            <div class="mini_head">
              <div class='mini_title'>Progress</div>
            </div>
            <TlAggrView v-if="taskLoaded"
                        style="width: 100%; height:100%;" :app="app"/>
        </el-col>

        <el-col v-if="true" :span="6" style="height: 100%;" class="boundary">
            <div class="mini_head">
              <div class='mini_title'>Machine View</div>
            </div>
            <el-row style="height: 32%">
              <div v-if="!finishSimulation" style="width: 100%; height: 100%;margin-top: 10px; margin-left: 10px; "
                   class="overviewContainer">
                <TaskMatrix v-if="app !== null && app.taskList.length>0 && !finishSimulation && overviewMatrix"
                            :selectTaskCount="app.selectTaskCount" :taskCount="app.taskCount"
                            :taskList="app.taskList"
                            :maxTime="app.maxTime"
                            :minTime="app.minTime"
                            :dependence="true"
                            :ch="50"
                            :style="'height:'+ matrixSize + 'px;' + 'width: ' + matrixSize  +'px;'"
                            :showDataflow="showDataflow"
                            :interaction="'zoom'"
                            :app="app"
                ></TaskMatrix>
              </div>
              <div v-if="finishSimulation && overviewMatrix" style="width: 100%; height: 100%;margin-top: 10px;margin-left: 10px;"
                   class="overviewContainer">
                <TaskMatrixNew :selectTaskCount="app.selectTaskCount" :taskCount="app.taskCount"
                               :taskList="app.taskList"

                               :maxTime="app.maxTime"
                               :minTime="app.minTime"
                               :dependence="true"
                               :ch="50"
                               :style="'height:'+ matrixSize + 'px;' + 'width: ' + matrixSize  +'px;'"
                               :showDataflow="showDataflow"
                               :interaction="'zoom'"
                               :app="app"
                               :abnormalDeps="app.abnormalDeps"
                               :interactiveModule="app.interactiveModule"
                               :selectedTasks="app.interactiveModule.selectedTasks"
                               :selectedDeps="app.interactiveModule.selectedDeps"
                               :srcAffectedTasks="app.interactiveModule.srcAffectedTasks"
                               :dstAffectedTasks="app.interactiveModule.dstAffectedTasks"
                               :srcAffectedDeps="app.interactiveModule.srcAffectedDeps"
                               :dstAffectedDeps="app.interactiveModule.dstAffectedDeps"
                ></TaskMatrixNew>
              </div>
            </el-row>

            <el-row style="height: 68%; margin-top: -30px; overflow-y: scroll; text-align: left;"
                    :style="{height: `calc(100% - ${matrixSize + 20 + matrixSize * .03}px`}"
                    v-if="app!==null">
                <MachineBox
                    v-for="machine in app.machineList" :key="machine.machine_id" :machine="machine"
                    :metricHeight="50"
                    :subMatrixSize="subMatrixSize"
                    style="margin-left: 6px; margin-bottom: 7px; display: inline-block;">
                </MachineBox>
            </el-row>

        </el-col>

      </el-row>
    </div>
  </div>

</template>

<script>

import {mapGetters, mapState} from "vuex";

import * as d3 from "d3";

import DAGDiagram from "@/components-new/DAGDiagram";

import TaskListNew from "@/components/Task/TaskListNew";
import TaskMatrix from "@/components-new/MachineView/MachineBox/TaskMatrix"
import TaskMatrixNew from "@/components-new/MachineView/MachineBox/TaskMatrixNew"

import MachineBox from "@/components/machineBox/MachineBox";

import TlAggrView from "@/components-new/TlAggrView";

export default {
  name: 'Simulation',
  components: {

    TaskMatrix,
    MachineBox,
    DAGDiagram,
    TlAggrView,

    TaskListNew,
    TaskMatrixNew
    // ScatterView,
  },

  data() {
    return {
      curAid: null,

      simRateLocal: null,     // only represent frontend sim rate
      activeView: "ScatterView",
      temp: [1, 2, 3, 4],
      initialized: true,
      oHeight: 0,
      oWidth: 0,
      matrixSize: 0,
      selectedMetrics: {
        'task': true,
        'cpu': true,
        'memory': true,
        'network': true,
        'disk': true,
        'dependence': true
      },
      subMatrixSize: 0,
      isLoadDirectly: false
    }
  },
  created() {
    this.$store.dispatch('simulation/getAppMetaList');
  },
  mounted() {
    let rect = d3.select(".overviewContainer").node().getBoundingClientRect();
    // this.oWidth = Math.min([rect.height, rect.width]);
    // this.oHeight = this.oWidth+45
    this.oWidth = rect.width * 0.95;
    this.oHeight = rect.height * 0.95;
    this.matrixSize = Math.min(this.oHeight, this.oWidth) * 3 / 4

    this.subMatrixSize = this.oWidth / 2 - 10
    console.log('oHeight', this.oHeight, this.oWidth, this.subMatrixSize)
  },
  methods: {
    getApplication() {
      this.$store.dispatch('simulation/getApplication', this.curAid);
    },

    simulationClick() {
      // this.queryProgress()
        console.log(this.simRunning);
      if (this.isLoadDirectly) {
        this.loadDirectly();
      } else if (this.simRunning) {
        this.stopSimulator()
      } else {
        // this.$store.commit("comparison/simulationChangeShowingApp", this.app)
        this.startSimulator()
      }

    },
    startSimulator() {
      this.$store.commit('simulation/startSimulation')
    },
    stopSimulator() {
      this.$store.commit('simulation/stopSimulation')
    },
    loadDirectly() {
      this.$store.dispatch('simulation/queryDirectlyLoad', this.dataName)
    },

    canStartSim() {
      return !this.simRunning && this.dataName != null
    },
    handleChangeSimRate() {
      // update backend
      this.$store.dispatch('simulation/updateSimRate', this.simRateLocal)
    },
  },
  watch: {
    curAid() {
      this.getApplication();
    },
    simRate(val, oldVal) {
      if (!oldVal) {
        this.simRateLocal = val
      }
    }
  },
  computed: {
    ...mapState('simulation', {
      appMetaList: state => state.appMetaList,
      app: state => state.application,

      finishSimulation: state => state.finishSimulation,
      taskLoaded: state => state.application !== null && state.application.taskLoaded && state.application.taskList.length > 0,
      simRate: state => state.simRate,
      machineList: state => state.machineList,
      taskCount: state => state.taskCount,
      selectTaskCount: state => state.selectTaskCount,
      taskList: state => state.taskList,
      renderSign: state => state.renderSign,
      maxTime: state => state.maxTime,
      minTime: state => state.minTime,
      inLoading: state => state.inLoading,

      showDataflow: state => state.showDataflow,
      overviewMatrix:state=>state.application.overviewMatrix
    }),
    ...mapGetters('simulation', {
      simRunning: 'running',
    }),
    showCompound: {
      get() {
        return this.$store.state.simulation.showCompound
      },
      set() {
        this.$store.commit('simulation/changeShowCompound',
            !this.showCompound)
      }
    },
  }
}
</script>

<style>
.selectContainer {
  margin: 0 auto;
}

.container {
  width: 100%;
  height: 100%;
}

/*#simulation {*/
/*    margin: 6px;*/
/*    width: calc(100% - 12px);*/
/*    height: calc(100% - 12px);*/

/*    !* use grid layout rather than el-row *!*/
/*    !* because el-row and el-scrollbar can't be used together *!*/
/*    display: grid;*/
/*    grid-template-columns: 10% auto;*/
/*    grid-template-rows: auto 60%;*/
/*    grid-template-areas:*/
/*                "sidebar upper"*/
/*                "sidebar lower";*/
/*    grid-gap: 10px 10px;*/
/*}*/
#simulation {
  margin: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);

  /* use grid layout rather than el-row */
  /* because el-row and el-scrollbar can't be used together */

}

#sidebar {
  grid-area: sidebar;
  width: 100%;
  height: 100%;
  text-align: left;
}

#dag-diagram-card {
  width: 100%;
  height: 100%;
  /*border-style: dashed;*/
  /*border-width: 1px;*/
}

#incremental-view-card {
  grid-area: lower;
  width: 100%;
  height: 100%;
  /*border-style: dashed;*/
  /*border-width: 1px;*/
}

.el-card >>> .el-card__body {
  padding: 10px;
  width: calc(100% - 10px * 2);
  height: calc(100% - 10px * 2);
}

.el-scrollbar {
  height: 100%;
  overflow-x: hidden;
}

.el-scrollbar >>> .el-scrollbar__wrap {
  height: 100%;
  overflow-x: hidden;
}

.el-tabs >>> .el-tabs__content {
  height: 100%;
  width: 100%;
}

.titletext {
  margin-left: 20px;
  margin-top: 10px;
  font-size: 15px;
}

.nav2 {
  /*font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;*/
  font-family: "Hiragino Sans GB";

  border-bottom-right-radius: 4px;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
  border-top-right-radius: 4px;
  background: #ccc;
  list-style-type: none;
  height: 42px;
  margin: 0;
  padding: 0;
  overflow: hidden;
  color: #444444;
  text-align: left;

}

.el-input__inner {
  background-color: #f5f5f5;
}

.el-input-number__decrease {
  background-color: #dcdcdc;
}

.el-input-number__increase {
  background-color: #dcdcdc;
}

.el-button--mini {
  background-color: #dcdcdc;
}

.el-button.is-disabled {
  background-color: #dcdcdc;
}
</style>
