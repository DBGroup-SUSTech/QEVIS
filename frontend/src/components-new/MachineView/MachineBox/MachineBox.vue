<template>
    <div style="text-align:center; border: gray solid 0.5px; border-radius: 3px; padding-right: 1px;">
        <div style="font-size:10px">{{ machine.machineName }}</div>
        <el-row>
            <TaskMatrixNew :style="'height:'+ subMatrixSize + 'px;' + 'width: ' + subMatrixSize  +'px;'"
                           :taskMatrixModel="taskMatrixModel"
            ></TaskMatrixNew>
        </el-row>
        <el-row>
            <TaskCount
                    v-if="selectedMetrics.task"
                    :app="taskMatrixModel.application"
                    :tasks="taskMatrixModel.taskMatrixVOList"
                    :width="subMatrixSize"
                    :height="metricHeight-2"
                    :style="'height:'+metricHeight + 'px;' + 'width: ' + subMatrixSize+'px;'"></TaskCount>
        </el-row>
        <el-row>
            <CPUUsage style="margin-top:0"
                      v-if="selectedMetrics.cpu"
                      :app="taskMatrixModel.application"
                      :machine="taskMatrixModel.machine"
                      :width="subMatrixSize"
                      :height="metricHeight-2"
                      :style="'height:'+metricHeight + 'px;' + 'width: ' + subMatrixSize+'px;'"></CPUUsage>
        </el-row>

        <el-row>
            <NetIO style="margin-top:0"
                   v-if="selectedMetrics.network"
                   :app="taskMatrixModel.application"
                   :machine="taskMatrixModel.machine"
                   :width="subMatrixSize"
                   :height="metricHeight-2"
                   :style="'height:'+metricHeight + 'px;' + 'width: ' + subMatrixSize+'px;'"></NetIO>
        </el-row>
        <el-row >
            <MemoryUsage style="margin-top:0"
                         v-if="selectedMetrics.memory"
                         :app="taskMatrixModel.application"
                         :machine="taskMatrixModel.machine"
                         :width="subMatrixSize"
                         :height="metricHeight-2"
                         :style="'height:'+metricHeight + 'px;' + 'width: ' + subMatrixSize+'px;'"></MemoryUsage>
        </el-row>
        <el-row >
            <DiskIO style="margin-top:0"
                    v-if="selectedMetrics.disk"
                    :app="taskMatrixModel.application"
                    :machine="taskMatrixModel.machine"
                    :width="subMatrixSize"
                    :height="metricHeight-2"
                    :style="'height:'+metricHeight + 'px;' + 'width: ' + subMatrixSize+'px;'"></DiskIO>
        </el-row>
    </div>
</template>

<script>

/* eslint-disable */

import TaskMatrix from "@/components-new/MachineView/MachineBox/TaskMatrix";
import TaskCount from "@/components-new/MachineView/MachineBox/TaskCount";
import CPUUsage from "@/components-new/MachineView/MachineBox/CPUUsage";
import MemoryUsage from "@/components-new/MachineView/MachineBox/MemoryUsage";
import NetIO from "@/components-new/MachineView/MachineBox/NetIO";
import DiskIO from "@/components-new/MachineView/MachineBox/DiskIO";
import {mapState} from "vuex";
import TaskMatrixNew from "@/components-new/MachineView/MachineBox/TaskMatrixNew";

export default {
    name: "MachineBox",
    components: {
        TaskMatrixNew,
        TaskMatrix,
        TaskCount,
        CPUUsage,
        MemoryUsage,
        NetIO,
        DiskIO
    },
    props: ['app', 'machine', 'taskMatrixModel', 'metricHeight', 'subMatrixSize', 'selectedMetrics',],
    data() {
        return {
        }
    },
    mounted() {
    },
    method: {},
    computed: {
        ...mapState('comparison',{
        }),
    },
    watch:{
    }
}
</script>

<style scoped>

</style>
