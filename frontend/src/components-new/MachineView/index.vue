<template>
    <div style="height: 100%; width: 100%">
        <el-row style="width: 100%">
            <div style="width: 100%; display: flex;flex-direction: column;align-content: center;align-items: center;"
                 class="overviewContainer">

                <div>
                    <el-checkbox-group class="checkbox-group" size="mini" :fill="'#999999'"
                                       v-model="selectedMetricsArray" @change="checkboxChange">
                        <el-checkbox-button label="task">Task count</el-checkbox-button>
                        <el-checkbox-button label="cpu">CPU</el-checkbox-button>
                        <el-checkbox-button label="memory">Memory usage</el-checkbox-button>
                        <el-checkbox-button label="network">Network IO</el-checkbox-button>
                        <el-checkbox-button label="disk">Disk IO</el-checkbox-button>
                    </el-checkbox-group>

<!--                    <el-button class="dep-button" @change="buttonChange" size="mini">Dependency</el-button>-->
                </div>


                <TaskMatrixNew v-if="app.showOverviewMatrix" style="margin-top: 5px;"
                               :style="'height:'+ matrixSize + 'px;' + 'width: ' + matrixSize  +'px;'"
                               :taskMatrixModel="app.mainTaskMatrixModel"
                ></TaskMatrixNew>

            </div>


        </el-row>

        <el-row v-if="shownTaskMatrixModels.length > 0"
                style="overflow-y: scroll; text-align: left; margin-top: 10px;"
                :style="{height: `calc(100% - ${matrixSize + 20 + matrixSize * .03}px`}">
            <MachineBox v-for="(model) in shownTaskMatrixModels" :key="model.machine.machineName"
                        :app="app"
                        :machine="model.machine"
                        :taskMatrixModel="model"
                        :metricHeight="50"
                        :subMatrixSize="subMatrixSize"
                        :selectedMetrics="selectedMetrics"
                        style="margin-left: 6px; margin-bottom: 7px; display: inline-block;"></MachineBox>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import {mapState} from "vuex"
import TaskMatrix from './MachineBox/TaskMatrix';
import MachineBox from "./MachineBox/MachineBox";
import {Application} from "@/utils/entities/Application";
import TaskMatrixNew from "@/components-new/MachineView/MachineBox/TaskMatrixNew";
import {ArrayUtils} from "@/utils/utils/ArrayUtils";

export default {
    name: "MachineView",
    props: {
        app: Application,
    },
    components: {
        TaskMatrixNew,
        TaskMatrix, MachineBox
    },
    data() {
        return {
            oHeight: 0,
            oWidth: 0,
            matrixSize: 0,
            subMatrixSize: 0,
            selectedMetrics: {
                'task': false,
                'cpu': false,
                'memory': false,
                'network': false,
                'disk': false,
                'dependence': true
            },
            selectedMetricsArray: [],

            // interactiveModule: {
            //     selectedTasks: [],
            //     selectedDeps: [],
            //     srcAffectedTasks: [],
            //     dstAffectedTasks: [],
            //     srcAffectedDeps: [],
            //     dstAffectedDeps: []
            // }

        }
    },
    methods: {
        checkboxChange(selected) {
            Object.keys(this.selectedMetrics)
                    .forEach(key => this.selectedMetrics[key] = selected.indexOf(key) !== -1);
            console.log(this.selectedMetrics)
        },
        buttonChange(value) {
            this.selectedMetrics['dependence'] = value;
            console.log(this.selectedMetrics)
        }
    },
    watch: {
    },
    mounted() {
        let rect = this.$el.getBoundingClientRect();
        // this.oWidth = Math.min([rect.height, rect.width]);
        // this.oHeight = this.oWidth+45
        this.oWidth = rect.width;
        this.oHeight = rect.height;
        this.matrixSize = Math.min(this.oHeight, this.oWidth) * 0.9
        // console.log('matrix', this.$el, this.oHeight, this.oWidth)
        this.subMatrixSize = this.oWidth / 2 - 20
    },
    computed: {
        ...mapState('comparison', {
        }),
        shownTaskMatrixModels() {
            const ret = [];
            this.app.selectedMachines.forEach(machineName => {
                const model = ArrayUtils.find(this.app.taskMatrixModels,
                        model => model.machine.machineName === machineName);
                if (model) {
                    ret.push(model);
                }
            })
            return ret;
        }
    }
}
</script>

<style scoped>
.checkbox-group >>> .el-checkbox-button__inner {
    padding: 4px 8px;
    font-size: 11px;
}

.checkbox-group, .dep-button {
    float: left;
    margin: 5px 0 2px 5px;
}

.dep-button {
    padding: 6px 10px !important;
    font-size: 11px !important;
}
</style>
