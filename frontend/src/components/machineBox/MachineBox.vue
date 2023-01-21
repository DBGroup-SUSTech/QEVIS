<template>
    <div style="text-align:center; border: gray solid 0.5px; border-radius: 3px;" v-if="selectedMachine">
        <div style="font-size:10px">{{machine.machineId}}</div>
<!--        <el-row>-->
<!--            <el-radio style="z-index: 1000; right:0" v-model="directShown" label="src">Src</el-radio>-->
<!--            <el-radio style="z-index: 1000" v-model="directShown" label="dst">Dst</el-radio>-->
<!--        </el-row>-->
        <el-row>
          <TaskMatrix :selectTaskCount="machine.selectTaskCount" :id="machine.machineId"
                      :taskList="machine.taskList" v-if="initialized && !finishSimulation" :maxTime="maxTime" :minTime="minTime"
                      :status="machine.status"
                      :ch="35"
                      :style="'height:'+height + 'px;' + 'width: ' + width+'px;'"
                      :directShown="directShown"
                      :interaction="'zoom'"
                      :showDataflow="showDataflow"
          ></TaskMatrix>

          <TaskMatrixNew :selectTaskCount="machine.selectTaskCount" :id="machine.machineId"
                         :taskList="machine.taskList" v-if="initialized && finishSimulation" :maxTime="maxTime" :minTime="minTime"
                         :status="machine.status"
                         :ch="35"
                         :matrixSize="subMatrixSize"
                         :style="'height:'+height + 'px;' + 'width: ' + width+'px;'"
                         :directShown="directShown"
                         :interaction="'zoom'"
                         :showDataflow="showDataflow"
                         :dependence="false"
                         :isMachine="true"
                         :app="app"
                         :abnormalDeps="ownAbnormalDeps"


                         :interactiveModule="interactiveModule"
                         :selectedTasks="ownSelectedTasks"
                         :selectedDeps="ownSelectedDeps"
                         :srcAffectedTasks="ownSrcAffectedTasks"
                         :dstAffectedTasks="ownDstAffectedTasks"
                         :srcAffectedDeps="ownSrcAffectedDeps"
                         :dstAffectedDeps="ownDstAffectedDeps"
          ></TaskMatrixNew>


        </el-row>
        <el-row style="margin-top:10px">
            <TaskCount :ch="metricHeight-2"
                       :width="width"
                       :height="metricHeight-2"
                       :id="machine.machineId"
                       :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></TaskCount>
        </el-row>
        <el-row style="margin-top:10px">
            <CPUUsage :ch="metricHeight-2"
                      :width="width"
                      :height="metricHeight-2"
                      :status="machine.status"
                      :id="machine.machineId"
                      :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></CPUUsage>
        </el-row>
        <el-row style="margin-top:10px">
            <NetIO :ch="metricHeight-2"
                   :width="width"
                   :height="metricHeight-2"
                   :status="machine.status"
                   :id="machine.machineId"
                   :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></NetIO>
        </el-row>
        <el-row style="margin-top:10px">
            <MemoryUsage :ch="metricHeight-2"
                         :width="width"
                         :height="metricHeight-2"
                         :status="machine.status"
                         :id="machine.machineId"
                         :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></MemoryUsage>
        </el-row>
        <el-row style="margin-top:10px">
            <DiskIO :ch="metricHeight-2"
                    :width="width"
                    :height="metricHeight-2"
                    :status="machine.status"
                    :id="machine.machineId"
                    :taskList="machine.taskList" :style="'height:'+metricHeight + 'px;' + 'width: ' + width+'px;'"></DiskIO>
        </el-row>


    </div>
</template>

<script>

import TaskMatrix from "@/components/machineBox/TaskMatrix";
import TaskMatrixNew from "@/components-new/MachineView/MachineBox/TaskMatrixNew";
import TaskCount from "@/components/machineBox/TaskCount";
import CPUUsage from "@/components/machineBox/CPUUsage";
import MemoryUsage from "@/components/machineBox/MemoryUsage";
import NetIO from "@/components/machineBox/NetIO";
import DiskIO from "@/components/machineBox/DiskIO";
import {mapState} from "vuex";

export default {
    name: "MachineBox",
    components: {
        TaskMatrix,
        TaskMatrixNew,
        TaskCount,
        CPUUsage,
        MemoryUsage,
        NetIO,
        DiskIO
    },
    data() {
        return {
            width: 25,
            height: 25,
            initialized: false,
            maxTime: 0,
            minTime: 0,

            directShown: this.machine == undefined ? '' : 'src',

        }
    },
    props: ['machine', 'metricHeight', 'subMatrixSize'],
    mounted() {
        // this.width = this.$el.clientWidth;
        // this.height = this.$el.clientHeight;
        // this.width = this.$el.clientWidth - 5;
        this.width = this.subMatrixSize
        //TODO: hard code
        this.height = this.width;
        this.initialized = true;
        console.log('machine', this.machine)
    },
    method: {},
    computed: {
        ...mapState('simulation', {
            taskList: state => state.application.taskList,
            renderSign: state => state.renderSign,
            showDataflow: state => state.showDataflow,
          finishSimulation: state=> state.finishSimulation,
            app: state => state.application,
          selectedMachineMetrics: state => state.application.selectedMachineMetrics,
        }),
      selectedMachine(){
        return this.selectedMachineMetrics[this.machine.machineId]
      },
      interactiveModule(){
          return this.app.interactiveModule
      },
      ownAbnormalDeps(){
        let ownDeps = []
        this.app.abnormalDeps.forEach(dep=>{
          if(dep.srcTask.machine_id == this.machine.machineId
              || dep.dstTask.machine_id == this.machine.machineId){
            ownDeps.push(dep)
          }
        })
        return ownDeps
      },
      ownSelectedTasks(){
        let ownTasks = []
        this.interactiveModule.selectedTasks.forEach(task=>{
          if(task.machine_id == this.machine.machineId){
            ownTasks.push(task)
          }
        })
        return ownTasks
      },
      ownSelectedDeps(){
        let ownDeps = []
        this.interactiveModule.selectedDeps.forEach(dep=>{
          if(dep.srcTask.machine_id == this.machine.machineId
              || dep.dstTask.machine_id == this.machine.machineId){
            ownDeps.push(dep)
          }
        })
        return ownDeps
      },
      ownSrcAffectedTasks(){
        let ownTasks = []
        this.interactiveModule.srcAffectedTasks.forEach(task=>{
          if(task.machine_id == this.machine.machineId){
            ownTasks.push(task)
          }
        })
        return ownTasks
      },
      ownDstAffectedTasks(){
        let ownTasks = []
        this.interactiveModule.dstAffectedTasks.forEach(task=>{
          if(task.machine_id == this.machine.machineId){
            ownTasks.push(task)
          }
        })
        return ownTasks
      },
      ownSrcAffectedDeps(){
        let ownDeps = []
        if(!this.interactiveModule.srcAffectedDeps) return []
        this.interactiveModule.srcAffectedDeps.forEach(dep=>{
          if(dep.srcTask.machine_id == this.machine.machineId
              || dep.dstTask.machine_id == this.machine.machineId){
            ownDeps.push(dep)
          }
        })
        return ownDeps
      },
      ownDstAffectedDeps(){
        let ownDeps = []
        if(!this.interactiveModule.dstAffectedDeps) return []
        this.interactiveModule.dstAffectedDeps.forEach(dep=>{
          if(dep.srcTask.machine_id == this.machine.machineId
              || dep.dstTask.machine_id == this.machine.machineId){
            ownDeps.push(dep)
          }
        })
        return ownDeps
      }
        // width() {
        //   if(this.$el){
        //     return this.$el.clientWidth
        //   }
        //   return 30;
        // }
    }
}
</script>

<style scoped>

</style>
