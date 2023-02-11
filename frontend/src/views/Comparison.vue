<template>
    <div class="container" v-loading = "isLoading"
         element-loading-text="Loading"
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(255,255, 255, 0.8)"
    >
        <!--    <ul class="nav2">-->
        <!--      <el-row>-->
        <!--        <el-col :span="8">-->
        <!--          <li class="titletext">Query Execution Analysis</li>-->
        <!--        </el-col>-->
        <!--      </el-row>-->
        <!--    </ul>-->
        <div id="main-pane" style="position: relative">
            <el-row style="height: 100%; width: 100%;" :gutter="8">
                <el-col :span="5" style="height: 100%" >
                    <el-row class="boundary" style="width: 100%; height: calc(100%); overflow: hidden">
                        <div class="mini_head">
                            <div class='mini_title'>Query List</div>
                        </div>
                        <div class="dag-container" style="height: calc(100% - 30px);">
                            <div v-for="(app, index) in applications" :key="app.aid" class="dag-item"
                                 :class="{'dag-item-collapse': app.dagDiagramCollapse,
                  'dag-item-not-collapse': !app.dagDiagramCollapse}">
                                <div class="card-head" style="">
                                    <el-icon class="el-icon-caret-bottom" v-show="!app.dagDiagramCollapse"
                                             @click.native="clickCollapseIcon(app)"/>
                                    <el-icon class="el-icon-caret-right" v-show="app.dagDiagramCollapse"
                                             @click.native="clickCollapseIcon(app)"/>
                                    <span style="font-size: 1em; margin-left: 5px;">{{ index + ' ' + app.queryName }}</span>


                                    <el-icon v-if="index <= -1" class="el-icon-loading mini-icon"
                                             style="margin-left: auto"/>
                                    <el-icon v-else class="el-icon-finished mini-icon" style="margin-left: auto"/>

                                    <svg width="25" height="25" class="mini-icon"
                                         style="cursor: pointer; margin-top: 2px;"
                                         @click="clickSQLIcon(app)"
                                         t="1630996342926" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                                         p-id="2191">
                                        <path
                                                d="M298.337 320.634l-55.116 48.677c-19.402-26.983-39.066-40.39-59.171-40.39-9.789 0-17.726 2.645-23.986 7.849-6.174 5.204-9.347 11.109-9.347 17.726 0 6.525 2.207 12.787 6.702 18.606 6.001 7.849 24.252 24.605 54.587 50.266 28.396 23.723 45.678 38.714 51.677 44.973 15.081 15.254 25.837 29.806 32.099 43.741 6.26 13.933 9.434 29.101 9.434 45.595 0 32.099-11.109 58.641-33.246 79.54-22.223 20.899-51.147 31.396-86.773 31.396-27.868 0-52.116-6.79-72.841-20.46-20.636-13.67-38.359-35.095-53.087-64.375l62.611-37.742c18.783 34.57 40.476 51.852 64.992 51.852 12.787 0 23.547-3.703 32.276-11.2 8.731-7.407 13.052-16.048 13.052-25.837 0-8.907-3.263-17.726-9.877-26.63-6.614-8.907-21.074-22.396-43.387-40.653-42.592-34.745-70.194-61.554-82.627-80.425s-18.606-37.742-18.606-56.527c0-27.158 10.316-50.443 31.042-69.842 20.636-19.402 46.207-29.103 76.545-29.103 19.489 0 38.097 4.499 55.823 13.581 17.542 8.908 36.678 25.398 57.227 49.386v0z"
                                                p-id="5238"></path>
                                        <path
                                                d="M684.673 601.499l68.078 88.006h-88.182l-34.57-44.533c-28.57 15.695-60.495 23.455-95.591 23.455-58.729 0-107.585-20.283-146.474-60.758-38.89-40.476-58.288-88.801-58.288-144.798 0-37.389 9.082-71.783 27.158-103.087s42.945-56.174 74.69-74.605c31.657-18.429 65.699-27.69 102.029-27.69 55.555 0 103.174 20.017 143.035 60.141 39.86 40.036 59.79 88.89 59.79 146.563 0 53.088-17.283 98.765-51.677 137.303v0zM638.197 541.357c15.787-23.371 23.633-49.295 23.633-77.691 0-37.036-12.523-68.518-37.567-94.447-25.044-25.837-55.291-38.799-90.827-38.799-36.595 0-67.194 12.61-91.886 37.742-24.692 25.221-37.036 57.143-37.036 96.031 0 43.297 15.518 77.514 46.651 102.646 24.339 19.663 51.94 29.541 82.893 29.541 17.726 0 34.481-3.44 50.087-10.406l-70.018-90.124h88.801l35.275 45.503z"
                                                p-id="5239"></path>
                                        <path d="M779.294 267.37h74.426v320.198h108.554v70.99h-182.981v-391.184z" p-id="5240"></path>
                                    </svg>
                                    <el-icon class="el-icon-s-data mini-icon"
                                             @click.native="clickShowDetailIcon(app)"
                                             :style="{color: getShowDetailIconColor(app)}"/>
                                    <!--                                    <el-icon class="el-icon-circle-plus mini-icon"-->
                                    <!--                                             style="margin-right: 0px;"-->
                                    <!--                                             @click.native="clickShowProgressIcon(app)"-->
                                    <!--                                             :style="{color: getShowProgressIconColor(app)}"/>-->
                                    <el-icon class="el-icon-circle-plus mini-icon"
                                             style="margin-right: 7px;"
                                             @click.native="clickShowProgressIcon(app)"
                                             :style="{color: getShowProgressIconColor(app)}"/>

                                </div>
                                <DAGDiagram v-if="!app.dagDiagramCollapse"
                                            style="width: 100%; height: calc(100% - 30px);" :app="app"/>
                            </div>
                        </div>
                    </el-row>
                </el-col>
                <el-col :span="9" style="height: 100%">
                    <el-row class="boundary" style="height: 100%; width: 100%; overflow: hidden;">
                        <div class="mini_head">
                            <div class='mini_title'>Query Overview</div>
                        </div>
                        <div class="tdag-container" style="height: calc(100% - 30px);" @touchmove.prevent @mousewheel.prevent>
                            <div v-for="(app) in selectedApps" :key="app.aid" class="tdag-item">
                                <div class="card-head">
                                    <span style="font-size: 0.9em; margin-left: 4px;">{{ app.queryName }}</span>
                                    <div class="ani-button-group">
                                        <svg @click="clickPlaybackSwitchIcon(app)" class="icon mini-icon"
                                             viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4170">
                                            <rect x="0" y="0" height="1024" width="1024" fill="none"/>
                                            <path v-if="isPlaybackOnGoing(app)"
                                                  d="M512 960C264.576 960 64 759.424 64 512S264.576 64 512 64s448 200.576 448 448-200.576 448-448 448z m0-64c212.064 0 384-171.936 384-384S724.064 128 512 128 128 299.936 128 512s171.936 384 384 384z m-128-543.936a31.968 31.968 0 1 1 64 0v319.872a31.968 31.968 0 1 1-64 0v-319.872z m192 0a31.968 31.968 0 1 1 64 0v319.872a31.968 31.968 0 1 1-64 0v-319.872z" fill="#000000" p-id="4500"></path>
                                            <path v-else
                                                  d="M512 989.866667C248.081067 989.866667 34.133333 775.918933 34.133333 512S248.081067 34.133333 512 34.133333s477.866667 213.947733 477.866667 477.866667-213.947733 477.866667-477.866667 477.866667z m0-68.266667c226.2016 0 409.6-183.3984 409.6-409.6S738.2016 102.4 512 102.4 102.4 285.7984 102.4 512s183.3984 409.6 409.6 409.6z m-61.2352-137.352533A33.792 33.792 0 0 1 409.6 751.3088V272.725333a33.655467 33.655467 0 0 1 49.2544-30.0032 33.416533 33.416533 0 0 1 9.5232 6.690134l238.592 238.830933a34.065067 34.065067 0 0 1 0 47.9232l-238.592 238.865067a33.4848 33.4848 0 0 1-17.6128 9.250133z m26.350933-430.523734v316.893867l158.276267-158.446933-158.276267-158.446934z" fill="#333333" p-id="4650"></path>
                                        </svg>
                                        <svg @click="clickPlaybackStopIcon(app)" class="icon mini-icon"
                                             viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6620">
                                            <rect x="0" y="0" height="1024" width="1024" fill="none"/>
                                            <path d="M512 960C264.576 960 64 759.424 64 512S264.576 64 512 64s448 200.576 448 448-200.576 448-448 448z m0-64c212.064 0 384-171.936 384-384S724.064 128 512 128 128 299.936 128 512s171.936 384 384 384z m-192-511.712A64.32 64.32 0 0 1 384.288 320h255.424A64.32 64.32 0 0 1 704 384.288v255.424A64.32 64.32 0 0 1 639.712 704H384.32A64.32 64.32 0 0 1 320 639.712V384.32z m64 31.616v192.192c0 17.408 14.272 31.904 31.904 31.904h192.192c17.408 0 31.904-14.272 31.904-31.904v-192.192c0-17.408-14.272-31.904-31.904-31.904h-192.192c-17.408 0-31.904 14.272-31.904 31.904z" fill="#000000" p-id="4800"></path>
                                        </svg>
                                        <el-popover
                                                placement="bottom"
                                                trigger="click"
                                                v-model="speedPopoverVisible">
                                            <div style="width: 100%; display: flex; justify-content: center; align-items: center;">
                                                <span style="margin-right: 10px;">Speed</span>
                                                <el-input-number
                                                        size="small"
                                                        style="width:100px"
                                                        :controls="false"
                                                        v-model="app.speedRatio"
                                                        :min="0.1"
                                                        :max="100"
                                                        :step="0.1"
                                                        :precision="1"/>
                                            </div>
                                            <svg slot="reference" class="icon mini-icon"
                                                 viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2805">
                                                <rect x="0" y="0" height="1024" width="1024" fill="none"/>
                                                <path d="M945 412H689c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h256c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM811 548H689c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h122c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM477.3 322.5H434c-6.2 0-11.2 5-11.2 11.2v248c0 3.6 1.7 6.9 4.6 9l148.9 108.6c5 3.6 12 2.6 15.6-2.4l25.7-35.1v-0.1c3.6-5 2.5-12-2.5-15.6l-126.7-91.6V333.7c0.1-6.2-5-11.2-11.1-11.2z" p-id="3358"></path><path d="M804.8 673.9H747c-5.6 0-10.9 2.9-13.9 7.7-12.7 20.1-27.5 38.7-44.5 55.7-29.3 29.3-63.4 52.3-101.3 68.3-39.3 16.6-81 25-124 25-43.1 0-84.8-8.4-124-25-37.9-16-72-39-101.3-68.3s-52.3-63.4-68.3-101.3c-16.6-39.2-25-80.9-25-124 0-43.1 8.4-84.7 25-124 16-37.9 39-72 68.3-101.3 29.3-29.3 63.4-52.3 101.3-68.3 39.2-16.6 81-25 124-25 43.1 0 84.8 8.4 124 25 37.9 16 72 39 101.3 68.3 17 17 31.8 35.6 44.5 55.7 3 4.8 8.3 7.7 13.9 7.7h57.8c6.9 0 11.3-7.2 8.2-13.3-65.2-129.7-197.4-214-345-215.7-216.1-2.7-395.6 174.2-396 390.1C71.6 727.5 246.9 903 463.2 903c149.5 0 283.9-84.6 349.8-215.8 3.1-6.1-1.4-13.3-8.2-13.3z" p-id="3359"></path>
                                            </svg>
                                        </el-popover>
                                    </div>
                                    <el-divider id='divider1' direction="vertical"/>
                                    <el-divider id='divider2' direction="vertical"/>
                                    <el-icon class="el-icon-view mini-icon icon"
                                             style="margin: 2px 7px 0 5px;" @click.native="clickShowTaskIcon(app)"
                                             :style="{color: getShowTaskIconColor(app)}"/>
                                </div>
                                <TDAGView style="width: 100%; height: calc(100% - 30px);" :app="app"/>
                            </div>
                        </div>
                    </el-row>
                </el-col>
                <el-col :span="5" style="height: 100%" >
                    <el-row class="boundary"
                            style="width: 100%; height: calc(100%); margin-top: 0px; overflow: hidden;">
                        <div class="mini_head">
                            <div class='mini_title'>Entity List</div>
                        </div>
                        <div class="task-list-container" style="height: calc(100% - 30px); width: 100%;">
                            <TaskListNew style="width: 100%; margin-left: -8px;"/>
                        </div>
                    </el-row>
                </el-col>
                <el-col :span="5" style="height: 100%">
                    <el-row class="boundary" style="height: 100%; width: 100%; overflow: hidden;">
                        <div class="mini_head">
                            <div class='mini_title'>Task View</div>
                        </div>
                        <div class="machine-view-container" style="height: calc(100% - 30px); width: 100%;">
                            <MachineView v-if="appShowingTask"
                                         style="width: 100%; height:100%;" :app="appShowingTask"/>
                        </div>
                    </el-row>
                </el-col>
            </el-row>
            <!--            <el-row style="height: 800px; width: 600px; position: absolute; left:0px; top:300px;background-color: #f5f5f5">-->
            <!--                <el-row class="boundary" style="height: 100%; width: 100%; overflow: hidden;">-->
            <!--                    <div class="mini_head">-->
            <!--                        <div class='mini_title'>Machine View</div>-->
            <!--                    </div>-->
            <!--                    <div class="machine-view-container" style="height: calc(100% - 30px); width: 100%;">-->
            <!--                        <MachineView style="width: 100%; height:100%;" :app="appShowingTask"/>-->
            <!--                    </div>-->
            <!--                </el-row>-->
            <!--            </el-row>-->
        </div>

        <div class="tooltip" v-if="tooltipData.show"
             :style="{
                    top: tooltipData.layout.y + 'px',
                    left: tooltipData.layout.x + 'px',
                    width: tooltipData.layout.width ? tooltipData.layout.width + 'px' : 'auto',
                } ">
            <div class="tooltip-text" style="font-weight: bold;">
                Task details
            </div>
            <div v-for="(item, i) in tooltipData.counterItems" :key="'counter' + i"
                 class="tooltip-text" style="margin-left: 10px;">
                {{ item.key + ': ' + item.value }}
            </div>
            <div class="tooltip-text" style="font-weight: bold;">
                Step time cost
            </div>
            <div v-for="(item, i) in tooltipData.steps" :key="'step' + i"
                 class="tooltip-text" style="margin-left: 10px;">
                {{ item.key + ': ' + item.value }}
            </div>
        </div>

    </div>

</template>

<script>
import {mapState} from "vuex";
import DAGDiagram from "@/components-new/DAGDiagram";
import TDAGView from "@/components-new/TDAGView";
import TaskListNew from "@/components-new/TaskListView";
import {AnimationStatus} from "@/utils/const/AnimationStatus";
import MachineView from "@/components-new/MachineView";

export default {
    name: 'Comparision',
    components: {
        DAGDiagram,
        TDAGView,
        TaskListNew,
        MachineView,
    },


    data() {
        return {
            oHeight: 0,
            oWidth: 0,
            collapseList: [],
            loading: false,
            loadingAppName: '',

            speedPopoverVisible: false,
        }

    },
    created() {
        this.$store.dispatch('comparison/getApplicationList')
    },

    mounted() {
        // let rect = d3.select(".overviewContainer").node().getBoundingClientRect();
        // // this.oWidth = Math.min([rect.height, rect.width]);
        // // this.oHeight = this.oWidth+45
        // this.oWidth = rect.width * 0.95;
        // this.oHeight = rect.height * 0.95;
        // console.log('oHeight', this.oHeight, this.oWidth)

    },
    methods: {
        // resetScale(){
        //     this.$store.commit('simulation/updateSelectTimeScale',[]);
        // },
        clickShowDetailIcon(app) {
            app.showDetail ^= true
        },
        getShowDetailIconColor(app) {
            return app.showDetail ? '#494949' : '#d9d9d9'
        },
        clickShowProgressIcon(app) {
            if (this.selectedApps.includes(app)) {
                this.$store.commit('comparison/removeSelectedApp', app.aid);
            } else {
                // this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: true})

                this.$store.dispatch('comparison/getStaticTDAGData', app.aid).then(() => {
                    this.$store.commit('comparison/addSelectedApp', app.aid);
                });

                // this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: false})
                // this.$store.dispatch('comparison/queryAppMonitorData', app.appName)
            }
        },
        getShowProgressIconColor(app) {
            return this.selectedApps.includes(app) ? '#494949' : '#d9d9d9'
        },
        clickPlaybackSwitchIcon(app) {
            this.$store.commit("comparison/switchPlaybackStatus", app.aid);
        },
        clickPlaybackStopIcon(app) {
            this.$store.commit("comparison/stopPlayback", {aid: app.aid, toReload: true});
        },
        clickShowTaskIcon(app) {
            if (app !== this.appShowingTask) {
                this.$store.commit("comparison/changeAppShowingTask", null);
                // this.loading = true
                // this.$store.commit("comparison/changeAppShowingTaskOverviewMatrix")
                this.$store.dispatch("comparison/getStaticExecutionData", app.aid).then(() => {
                    this.$store.commit("comparison/changeAppShowingTask", app.aid);
                })
                // app.overviewMatrix = !app.overviewMatrix
            } else {
                this.$store.commit("comparison/changeAppShowingTask", null);
            }
        },
        isPlaybackOnGoing(app) {
            return app.animationStatus === AnimationStatus.RUNNING;
        },
        getShowTaskIconColor(app) {
            return app === this.appShowingTask ? '#494949' : '#d9d9d9';
        },
        clickSQLIcon(app) {
            console.log(app)
            let content = new Blob([app.queryString])
            let urlObject = window.URL || window.webkitURL || window
            let url = urlObject.createObjectURL(content)
            let el = document.createElement('a')
            el.href = url
            el.download = app.queryName + '.sql'
            el.click()
            urlObject.revokeObjectURL(url)
        },
        clickCollapseIcon(app) {
            app.dagDiagramCollapse = !app.dagDiagramCollapse
        },
    },
    watch: {
        applications() {
            this.collapseList = this.applications.map(() => false)
        },
        taskLoaded(){
            // if (this.taskLoaded){
            //     this.$store.dispatch('comparison/queryAppMonitorData', this.loadedAppName)
            // }
        },
        // overviewMatrix(){
        //     if (this.perfCellClick && !this.appShowingTask.monitorDataLoaded){
        //         this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: true})
        //         this.$store.dispatch('comparison/queryAppMonitorData', this.appShowingTask.appName)
        //     }
        // },
        // selectedMachineMetrics(){
        //     if (this.perfCellClick && !this.appShowingTask.monitorDataLoaded){
        //         this.$store.commit("comparison/changeLoadingStatus",{loadingStatus: true})
        //
        //         this.$store.dispatch('comparison/queryAppMonitorData', this.appShowingTask.appName)
        //     }
        // }
    },
    computed: {
        ...mapState('comparison', {
            dataNames: state => state.dataNames,
            applications: state => state.applications,
            selectedApps: state => state.selectedApps,
            appShowingTask: state => state.appShowingTask,
            finishLoading : state => state.finishLoading,
            isLoading: state => state.isLoading,
            taskLoaded: state=>state.taskLoaded,
            // overviewMatrix: state=>state.appShowingTask ?? null,
            // selectedMachineMetrics: state=>state.appShowingTask ?? null,
            perfCellClick: state => state.perfCellClick,

            tooltipData: state => state.tooltipData,


            // machineList: state => state.machineList,
            // taskCount: state => state.taskCount,
            // selectTaskCount: state => state.selectTaskCount,
            // taskList: state => state.taskList,
            // renderSign: state => state.renderSign,
            // maxTime: state => state.maxTime,
            // minTime: state => state.minTime,
            // inLoading: state => state.inLoading,
            //
            // showDataflow: state => state.showDataflow,
        }),
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
#main-pane {
    /*margin: 6px;*/
    /*width: calc(100% - 12px);*/
    /*height: calc(100% - 12px - 42px);*/
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
    font-family: system-ui, serif;
    margin-left: 20px;
    margin-top: 8px;
    font-size: 18px;
    font-weight: bold;
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

.dag-container {
    overflow-y: scroll
}

.dag-item {
    margin: 6px 0 0 3px;
    border-style: solid;
    border-color: #d3dce6;
    border-width: 0.5px;
    border-radius: 3px;

    width: calc(100% - 10px);
}

.dag-item-not-collapse {
    height: 200px;
}

.dag-item-collapse {
    height: 30px;
}

.tdag-container {
    overflow-y: scroll
}

.tdag-item {
    margin: 6px 0 0 3px;
    border-style: solid;
    border-color: #d3dce6;
    border-width: 0.5px;
    border-radius: 3px;

    width: calc(100% - 10px);
    /*height: calc(50% - 12px);*/
}

.task-list-container {
    overflow-y: scroll
}

.machine-view-container {
    overflow: hidden;
}

.mini-icon {
    cursor: pointer;
    font-size: 1.2em;
    margin-left: 7px;

    width: 20px;
    height: 20px;
}

.card-head {
    height: 30px;
    display: flex;
    align-items: center;
}

.ani-button-group {
    margin: 2px 5px 0 auto;
    padding: 0 3px 0 3px;
}

#divider1 {
    margin: 0 108px 0 0;
}

#divider2 {
    margin: 0 0 0 0;
}

.icon {
    float: left;
    cursor: pointer;
    margin: 2px;
    border: rgba(255, 255, 255, 0) solid 1px;
    border-radius: 3px;
    transition: border 0.4s
}

.icon:hover {
    border: rgb(206, 206, 206) solid 1px;
}

.playback-icon {
    margin-right: 4px;
}

.tooltip {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 4px;

    background: white;
    border: #999999 solid 1px;
    border-radius: 4px;
}
.tooltip-text {
    font-size: 8px;
    text-align: left;
    font-family: system-ui, serif;
}
</style>
