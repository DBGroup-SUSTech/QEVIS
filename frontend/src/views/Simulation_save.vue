<template>
  <div id="simulation">

    <el-card id="sidebar" shadow="never">
      <el-select style="margin-left: 10px" v-model="dataName" placeholder="Select data" size="mini">
        <el-option
            v-for="name in dataNames"
            :key="name"
            :label="name"
            :value="name">
        </el-option>
      </el-select>
      <el-divider>Rate</el-divider>
      <span style="margin-left: 10px;">
                <el-input-number style="width:100px" v-model="simRateLocal" @change="handleChangeSimRate" size="mini"/>
            </span>
      <br/>
      <el-button style="margin-top: 10px; margin-left: 10px"
                 v-on:click="startSimulator"
                 :disabled="!canStartSim()"
                 size="mini">Start Simulation
      </el-button>
      <el-button style="margin-top: 10px" type="primary" v-on:click="stopSimulator" size="mini">Terminate
      </el-button>
      <el-divider>Others</el-divider>
    </el-card>

    <el-card id="dag-diagram-card" shadow="never" class="boundary">
      <el-row style="height: 100%" :gutter="10">
        <el-col :span="12" style="height: 100%" class="boundary">
          <DAGDiagram style="height: 100%; width: 100%;"></DAGDiagram>
        </el-col>
        <el-col :span="12" style="height: 100%; " class="boundary">
          <IncrementalView/>
        </el-col>
      </el-row>
    </el-card>

    <!--    <el-card id="incremental-view-card" shadow="never">-->
    <div style="height: 100%" :gutter="10">
      <el-row style="height: 100%" :gutter="10">
        <el-col :span="17" style="height: 100%; overflow-x: scroll; white-space: nowrap;text-align: left">
          <MachineBox v-for="machine in machineList" :key="machine.machine_id" :machine="machine"
                      style="width: 220px; height: 800px; display: inline-block;"></MachineBox>

        </el-col>
        <el-col :span="7" style="height: 100%;">
          <div style="width: 100%; height: 100%" class="overviewContainer">
            <TaskMatrix :selectTaskCount="selectTaskCount" :taskCount="taskCount"
                        :taskList="taskList" v-if="taskList.length>0" :maxTime="maxTime" :minTime="minTime"
                        :style="'height:'+ 800 + 'px;' + 'width: ' + oWidth +'px;'"></TaskMatrix>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import DAGDiagram from "@/components/DAGDiagram";
import IncrementalView from "@/components/IncrementalView";
import TaskMatrix from "@/components/machineBox/TaskMatrix"
// import ScatterView from "@/components/ScatterView"
// import TaskMatrix from "@/components/ScatterView/TaskMatrix";
import {mapGetters, mapState} from "vuex";
import MachineBox from "@/components/machineBox/MachineBox";
import * as d3 from "d3";
// import TweenLite from "gsap";

export default {
  name: 'Simulation',
  components: {
    MachineBox,
    IncrementalView,
    DAGDiagram,
    TaskMatrix
    // ScatterView,
  },

  data() {
    return {
      dataName: null,
      simRateLocal: null,     // only represent frontend sim rate
      activeView: "ScatterView",
      temp: [1, 2, 3, 4],
      initialized: true,
      oHeight: 0,
      oWidth: 0
    }
  },
  created() {
    // this.$store.dispatch('queryDag');
    this.$store.dispatch('simulation/queryAllDataNames')
    this.$store.dispatch('simulation/querySimRate')
  },
  mounted() {
    let rect = d3.select(".overviewContainer").node().getBoundingClientRect();
    // this.oWidth = Math.min([rect.height, rect.width]);
    // this.oHeight = this.oWidth+45
    this.oWidth = rect.width * 0.95;
    this.oHeight = rect.width * 0.95;
  },
  methods: {

    startSimulator() {
      this.$store.dispatch('simulation/startSimulator', this.dataName)
    },
    stopSimulator() {
      this.$store.dispatch('simulation/stopSimulator')
    },
    confirm() {
      this.$store.dispatch('simulation/queryDataByName', this.dataName);
    },
    queryDag() {
      this.$store.dispatch('simulation/queryDag', this.dataName);
      this.$store.dispatch('simulation/querySql', this.dataName);
    },
    canStartSim() {
      return !this.simRunning && this.dataName != null
    },
    handleChangeSimRate() {
      // update backend
      this.$store.dispatch('simulation/updateSimRate', this.simRateLocal)
    }
  },
  watch: {
    dataName(val, oldVal) {
      this.queryDag();
      console.log('new name', val, oldVal)
    },
    simRate(val, oldVal) {
      if (!oldVal) {
        this.simRateLocal = val
      }
    },
  },
  computed: {
    ...mapState('simulation', {
      dataNames: state => state.dataNames,
      simRate: state => state.simRate,
      machineList: state => state.machineList,
      taskCount: state => state.taskCount,
      selectTaskCount: state => state.selectTaskCount,
      taskList: state => state.taskList,
      renderSign: state => state.renderSign,
      maxTime: state => state.maxTime,
      minTime: state => state.minTime
    }),
    ...mapGetters('simulation', {
      simRunning: 'running',
    }),
  }
}
</script>

<style scoped>
#simulation {
  margin: 6px;
  width: calc(100% - 12px);
  height: calc(100% - 12px);

  /* use grid layout rather than el-row */
  /* because el-row and el-scrollbar can't be used together */
  display: grid;
  grid-template-columns: 10% auto;
  grid-template-rows: auto 60%;
  grid-template-areas:
                "sidebar upper"
                "sidebar lower";
  grid-gap: 10px 10px;
}

#sidebar {
  grid-area: sidebar;
  width: 100%;
  height: 100%;
  text-align: left;
}

#dag-diagram-card {
  grid-area: upper;
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
</style>
