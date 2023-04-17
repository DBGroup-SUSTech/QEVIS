/* eslint-disable */

import * as d3 from "d3";
import dataService from "@/service/dataService2";
import {Graph} from "@/utils/utils/graph";
import {VertexLayoutData} from "@/utils/entities/VertexLayoutData";
import {TLAggrAlgo} from "@/utils/algo/tl-aggregation/TLAggreAlgo";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";
import {VisHierarchyGraph} from "@/utils/entities/VisHierarchyGraph";
import {Application} from "@/utils/entities/Application";
import {TooltipData} from "@/utils/entities/TooltipData";
import {initApplication} from "@/utils/application-utils/AppInitializer";
import {loadStaticCounters, loadStaticTasks, loadStaticTaskStepInfo} from "@/utils/application-utils/TaskLoader";
import {LayoutConfig} from "@/utils/const/LayoutConfig";
import {layoutTDAG} from "@/utils/application-utils/TDAGLayout";
import {TDAGModel} from "@/utils/entities/TDAGModel";
import {loadStaticRecords} from "@/utils/application-utils/RecordLoader";
import {TreeModel} from "@/utils/entities/TreeModel";
import {AnimationStatus} from "@/utils/const/AnimationStatus";
import {loadDynamic} from "@/utils/application-utils/UpdateLoader";
import {TaskMatrixModel} from "@/utils/entities/TaskMatrixModel";
import {changeHighlightTask, changeHighlightTasks, changeHighlightVertex} from "@/utils/application-utils/Interaction";
import {loadStaticDiagnose} from "@/utils/application-utils/DiagnoseLoader";
import {loadStaticAbnormalTransfers, loadStaticMapTransfers} from "@/utils/application-utils/TransferLoader";


// const metrics = {
//   netIO: ['bytesRecv', 'bytesSent', 'dropin', 'dropout', 'errin', 'errout', 'packetsRecv', 'packetsSent'],
//   diskMetric: ['avgquSz', 'avgrqSz', 'await', 'rAwait', 'rkBs', 'rrqms', 'rs', 'wAwait', 'wkBs', 'wrqms', 'ws'],
//   diskMax: {'dm-0': {}, loop: {}, sdb: {}},
//   netIOMax: {}
//
// }
//
// metrics.diskMetric.forEach(metric => {
//   metrics.diskMax['dm-0'][metric] = 0;
//   metrics.diskMax.loop[metric] = 0;
//   metrics.diskMax.sdb[metric] = 0;
// })
// metrics.netIO.forEach(metric => {
//   metrics.netIOMax[metric] = 0;
// })

const xScale = d3.scaleLinear().range([LayoutConfig.marginLeft, LayoutConfig.width - LayoutConfig.marginRight]);

const dLine = d3.line().x(d => d.x).y(d => d.y);
const matrixLayoutCOnfig = {
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 0,
    height: 300,
    width: 100,
    matrixMin: {},
    matrixMax: {},
    upperHeight: 1000,
}

const mXScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginLeft, matrixLayoutCOnfig.width - matrixLayoutCOnfig.marginRight]);
const mYScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginTop, matrixLayoutCOnfig.height - matrixLayoutCOnfig.marginBottom]);
const mTYScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginTop, matrixLayoutCOnfig.height - matrixLayoutCOnfig.marginBottom]);


const getOrSetIfMiss = function (map, key, default_) {
    let res = map[key]
    if (res == undefined) {
        res = default_
        map[key] = default_
    }
    return res
}


// initial state
const state = () => ({
    /** @type {Application[]} */
    applications: [],
    /** @type {Map<number, Application>} */
    applicationMap: new Map(),
    /** @type {Application[]} */
    selectedApps: [],

    /** @type {Application} */
    appShowingTask: null,

    tdagViewWidth: 1000,

    layoutConfig: Object.assign({}, LayoutConfig),
    gapPixel: 25,       // the horizontal gasp between two vertex at same lane in data flow diagram

    inLoading: false,        // is data flow diagram in loading (by press button)
    finishLoading: false,

    tdagTransform: null,

    incTimeStep: 60 * 10,

    colorSchema: {
        'Map': "#1b9e77",
        'Reducer': "#D95F02",
        'selected': "purple",
        'MapFail': '#1b9e77',
        'ReducerFail': '#D95F02',
        'selectedFail': '#bb0000',
        'fail': '#000000',

        'highlightAsProvider': '#d55e5e',
        'highlightAsCurrent': 'purple',
        'highlightAsConsumer': '#3c76e5',
        'fetchHighlight': '#8c45dc',
    },

    isLoading: false,
    taskLoaded: false,

    selectedMachineMetrics: {},

    perfCellClick: false,

    tooltipData: new TooltipData(),
    groupedAppDomain:new Map(),
    groupDomain: [0,0],
    globalDomainUpdate: 0,
    zoomIn : 0,
    zoomOut: 0
})

// actions
const actions = {
    getApplicationList({commit}) {
        dataService.getApplicationList({
            "query_dag": true,
            "query_string": true,
            "query_plan": false,    // plan text is not needed
        }, resp => {
            commit('loadRawApplications', resp);
        })
    },
    getStaticTDAGData({commit}, aid) {
        return dataService.getStaticTDAGData({aid}, resp => {
            commit('loadStaticTDAGDataToApp', {aid, tdagData: resp});
        })
    },
    getStaticExecutionData({commit}, aid) {
        return dataService.getStaticExecutionData({aid}, resp => {
            console.log(resp);
            commit('loadStaticExecutionDataToApp', {aid, executionData: resp});
        });
    },
    getTransfer({state, commit}, {aid, tid}) {
        const app = state.applicationMap.get(aid);
        const task = app.taskMap.get(tid);
        return dataService.getTransferByTid({
            aid, tid, vid: task.vertex.vid,
        }, resp => {
            commit('cacheTransferList', {aid, tid, transferList: resp});
        });
    },

    queryUpdate({state, commit}, aid) {
        const app = state.applicationMap.get(aid);
        const nextAckRealTime = new Date();
        const realDuration = parseInt(nextAckRealTime - app.ackRealTime);
        const nextAckTime = app.ackTime + realDuration * (app.speedRatio || 1);
        // console.log('query -> ackTime:%d nextAckTime:%d realDuration:%d', app.ackTime, nextAckTime, realDuration);

        dataService.queryUpdate({
            aid: aid,
            start: app.ackTime,
            end: nextAckTime

        }, resp => {
            // console.log(resp)
            commit('handleUpdateData', {aid, updateData: resp});
        });
        commit('changeAnimationParam', {aid, nextAckTime, nextAckRealTime});
    },

    // --------------

    // Query the list of data names
    queryAllDags({state, commit, dispatch}) {
        dataService.getAllQueryData({}, resp => {
                let dagData = resp.dag
                let infoData = resp.info
                let sqlData = resp.sql

                for (let dataName in dagData) {
                    commit('addData', {dataName, dagData: dagData[dataName]})

                    const app = state.applicationMap.get(dataName)
                    commit('changeSqlData', {app, sql: sqlData[dataName]})
                    commit('changeAppInfo', {app, info: infoData[dataName]})
                }
            }
        )
        // dataService.getDatasetNames({}, resp => {
        //     commit('changeDataNames', resp)
        //     // resp = resp.slice(0, 4)
        //     resp.forEach(dataName => {
        //         dispatch('queryDag', dataName)
        //     })
        // })
    },
    // Query the static dag data, using dataName
    queryDag({commit, dispatch}, dataName) {
        dataService.queryDag({name: dataName}, resp => {
            commit('addData', {dataName, dagData: resp})
            dispatch('querySql', dataName)
            dispatch('queryAppInfo', dataName)
        })
    },
    queryAppInfo({state, commit}, dataName) {
        dataService.queryAppInfo({name: dataName}, resp => {
            const app = state.applicationMap.get(dataName)
            commit('changeAppInfo', {app, info: resp})
        })
    },
    // Query the sql, using dataName
    querySql({state, commit}, dataName) {
        dataService.querySql({name: dataName}, resp => {
            const app = state.applicationMap.get(dataName)
            commit('changeSqlData', {app, sql: resp})
        })
    },

    queryAppTasks({state, commit, dispatch}, {appName, application}) {
        //FIXME app problem when run comparison and simulation simultaneously
        let isSimulation = application !== null;
        const app = !isSimulation ? state.applicationMap.get(appName) : application;
        console.log("queryAppTasks", app, appName, application)
        if (!isSimulation && app.taskLoaded) {
            // state.totalLoading = true
            // state.isLoading = false
            commit('addSelectedApp', appName)
            commit('changeTaskLoadedStatus', true)

            state.isLoading = false
            state.totalLoading = true
            // state.taskLoaded = false
            return
        }

        commit('changeInLoading', true)
        dataService.queryFullTasks({name: appName}, resp => {
            console.log('queryFullTasks', resp)
            commit('changeInLoading', false)

            const tasks = resp.changed
            const diagnoseMatrix = resp.diagnoseMatrix
            if (!isSimulation) {
                commit('addSelectedApp', appName)
            }
            commit('initAppTasks', {app, tasks})
            commit('initialAppDiagnoseMatrix', {app, diagnoseMatrix})
            commit('changeTaskLoadedStatus', true)

            console.log("Application", app)
            // use timeout to insure tdag pane loads first
            setTimeout(() => commit('layoutAppTDAG', app), 0)

            state.isLoading = false
            state.totalLoading = true
            // state.taskLoaded = false

            // state.totalLoading = true
            // state.isLoading = false
        })
    },

    queryAppMonitorData({state, commit}, appName) {
        let timeStart = new Date()
        commit('changeInLoading', true)

        const app = state.applicationMap.get(appName)
        if (app.monitorDataLoaded) {
            commit('addSelectedApp', appName)
            commit('changeInLoading', false)
            state.isLoading = false
            state.totalLoading = true
            // state.taskLoaded = false
            return
        }

        let finishedCnt = 2
        let finishedCheck = function () {
            finishedCnt -= 1
            if (finishedCnt <= 0) {
                commit('changeAppShowingTask', appName)
                // commit('changeRenderSign', app)
                state.isLoading = false
                // state.taskLoaded = false
                state.totalLoading = true

                console.log("queryAppMonitorData", new Date() - timeStart)
                console.log("fetchdata time", new Date() - queryFetchDataTimeStart)
            }
        }

        dataService.queryFullMons({name: appName}, resp => {
            console.log('queryFullMons', resp)
            let timeStart = new Date()

            commit('updateMonData', {app, monData: resp})
            console.log("time query mon", new Date() - timeStart)
            finishedCheck()
        }, () => {
            console.warn('Get monitor data failed. appName' + appName)
            finishedCheck()
        })
        let queryFetchDataTimeStart = new Date()
        dataService.queryFullFetches({name: appName}, resp => {
            console.log('queryFullFetches', resp)
            let timeStart = new Date()
            commit('updateFetch', {app, ...resp})
            let timeUpdateFetch = new Date()
            commit('changeShowDataflow', {app, showDataflow: false})
            commit('processDataFlow', {app, ...resp});
            let timeEnd = new Date()

            console.log("time update fetch", timeUpdateFetch - timeStart)
            console.log("time process data flow", timeEnd - timeUpdateFetch)

            finishedCheck()
        })
    },

    // // Query the static data, using dataName
    // queryDirectlyLoad(context, dataName) {
    //   context.commit('changeInLoading', true)
    //   let finishedCnt = 4
    //   let finishedCheck = function () {
    //     finishedCnt -= 1
    //     if (finishedCnt <= 0) {
    //       context.commit('changeInLoading', false)
    //       context.commit('trgFinishLoading')
    //     }
    //   }
    //
    //   dataService.queryFullTasks({name: dataName}, d => {
    //     console.log('queryFullTasks: %o', d)
    //     // context.commit('changeFullTasks', d)
    //
    //     context.commit('updateAllTask', d.changed)
    //
    //     context.commit('changeClusterNumber', context.state.vertexes.length)
    //     context.commit('updateLayout')
    //
    //     finishedCheck()
    //     console.log('after finish check')
    //     dataService.queryFullMons({name: dataName}, d => {
    //       console.log('queryFullMons: %o', d)
    //       context.commit('updateMonData', d)
    //       finishedCheck()
    //     })
    //
    //     dataService.queryFullOutliers({name: dataName}, d => {
    //       console.log('queryFullOutliers: %o', d)
    //       context.commit('updateOutlierData', d)
    //       finishedCheck()
    //     })
    //
    //     dataService.queryFullFetches({name: dataName}, d => {
    //       console.log('queryFullFetches: %o', d)
    //       context.commit('updateFetch', d)
    //       context.commit('changeShowDataflow', true)
    //       context.commit('processDataFlow');
    //       console.log('results -----------', context.state.counters)
    //       console.log('results -----------', context.state.fetchData)
    //       finishedCheck()
    //     })
    //   })
    // },


    // Query the incr monitor data, then process the changed part
    queryFetchUpdate(context) {
        dataService.queryFetchUpdate({}, resp => {
            // console.log('fetch update %o', resp)
            context.commit('updateFetch', resp)
            // no need to care about stop flag here
        })
    },
    // Query the simulation rate
    querySimRate(context) {
        dataService.getSimRate({}, d => {
            console.log('get sim rate. %o', d)
            context.commit('changeSimRate', d)
        })
    },
    // Set the simulation rate
    updateSimRate(context, simRate) {
        dataService.updateSimRate({simRate}, d => {
            console.log('update sim rate. %o', d)
            // context.commit('changeSimRate', d)
        })
    },
    // The below functions are not used yet
    queryDataByName(context, dataName) {
        dataService.getConfiguration({name: dataName}, d => {
            console.log('getConfiguration ? ', d)
            // ??
        })
    },
}

// mutations
const mutations = {

    handleDrag(state, {aid, curClientX, curClientY}){
        let app = state.applicationMap.get(aid);
        let groupAppDomain = state.groupedAppDomain;
        if (groupAppDomain.has(aid)){ //linkage query
            Array.from(groupAppDomain.entries()).forEach(entry =>{
                let [aid, _] = entry;
                let app = state.applicationMap.get(aid);
                app.tdagModel.dragTrigger = true;
                app.tdagModel.dragPara.set("curClientX", curClientX);
                app.tdagModel.dragPara.set("curClientY", curClientY);
            });
        }else{
            app.tdagModel.dragPara.set("curClientX", curClientX);
            app.tdagModel.dragPara.set("curClientY", curClientY);
            app.tdagModel.dragTrigger = true
        }
    },
    closeDrag(state, {aid}){
        let app = state.applicationMap.get(aid);
        let groupAppDomain = state.groupedAppDomain;
        if (groupAppDomain.has(aid)){ //linkage query
            Array.from(groupAppDomain.entries()).forEach(entry =>{
                let [aid, _] = entry;
                let app = state.applicationMap.get(aid);
                app.tdagModel.dragTrigger = false;
            });
        }else{
            app.tdagModel.dragTrigger = false;
        }
    },

    handleZoom(state, {aid, zoomIn,zoomEventLen, zoomEventRatio}){
        let app = state.applicationMap.get(aid);
        let groupAppDomain = state.groupedAppDomain;
        var _this = this;
        if (groupAppDomain.has(aid)){ //linkage query
            Array.from(groupAppDomain.entries()).forEach(entry =>{
                let [aid, _] = entry
                let app = state.applicationMap.get(aid);
                app.tdagModel.zoomEventLen = zoomEventLen
                app.tdagModel.zoomEventRatio = zoomEventRatio
                _this.commit("comparison/updateQueryZoom",{app:app, zoomIn:zoomIn});
            });
        }else{
            app.tdagModel.zoomEventLen = zoomEventLen
            app.tdagModel.zoomEventRatio = zoomEventRatio
            this.commit("comparison/updateQueryZoom", {app:app, zoomIn:zoomIn})
            // console.log(app.tdagModel.zoomEventLen, app.tdagModel.zoomEventRatio)
        }
    },

    updateQueryZoom(state, {app, zoomIn}){
        // console.log(zoomIn, app.tdagModel.zoomScale, app.tdagModel.xScale.range())
        let curRange = app.tdagModel.xScale.range();
        let baseXScaleRange = app.tdagModel.baseXScaleRange[1];
        let tmpZoom = app.tdagModel.zoomScale;
        if (zoomIn){
            tmpZoom += 1
            if (app.tdagModel.zoomScale === 20)
                return;
            if (app.tdagModel.zoomScale < 0){
                app.tdagModel.updateXScaleRange(curRange[0], baseXScaleRange * Math.pow(2, tmpZoom))
                // app.tdagModel.zoomScale += 1
            }else {
                app.tdagModel.updateXScaleRange(curRange[0], baseXScaleRange + tmpZoom * baseXScaleRange)
            }
            app.tdagModel.zoomScale += 1
            // console.log(app.tdagModel.xScale.range())
        }else{
            tmpZoom -= 1
            if (app.tdagModel.zoomScale === -3){
                return
            }
            if (app.tdagModel.zoomScale <= 1){
                app.tdagModel.updateXScaleRange(curRange[0], baseXScaleRange * Math.pow(2, tmpZoom))
            }else{
                app.tdagModel.updateXScaleRange(curRange[0], baseXScaleRange + tmpZoom * baseXScaleRange)
            }
            app.tdagModel.zoomScale -= 1
        }
        // console.log(app.tdagModel.zoomScale, app.tdagModel.xScale.range())
    },

    loadRawApplications(state, rawApplications) {
        state.applications = [];
        state.applicationMap = new Map();
        let idx = -1
        let nameMap = {}
        let preIdx = 0, transIdx = 0
        rawApplications.forEach(ra => {
            idx += 1
            if (idx >= 4 && idx <= 9){

            }
            else if (ra.query_name === "query49"){
                 if (idx === 12 || idx ===19){
                    const app = initApplication(ra)
                    let vId = 0
                    if (nameMap[ra.query_name] !== undefined){
                        vId = nameMap[ra.query_name]+ 1
                    }else{
                        nameMap[ra.query_name] = vId
                    }
                    nameMap[ra.query_name] = vId
                    app.queryName = "AP_trans49_" + vId
                    state.applications.push(app);
                    state.applicationMap.set(app.aid, app);
                }
            }else{
                let vId = 0
                if (nameMap[ra.query_name] !== undefined){
                    vId = nameMap[ra.query_name]+ 1
                }else{
                    nameMap[ra.query_name] = vId
                }
                nameMap[ra.query_name] = vId

                const app = initApplication(ra)
                const transNames = ["prod_","cons_", "order_","sales_", "tax_", "trans_"]
                const prefixName = ["CI_AP_", "PDI_AP_", "CLD_AP_", "PI_AP_", "PI_AP_"]
                let tmp = app.queryName.split("query")[1]
                if (tmp === undefined){
                    tmp = "1"
                }else{
                    tmp = tmp.split("_")[0]
                }

                let name = prefixName[preIdx]
                preIdx += 1
                if (preIdx === 5)
                    preIdx = 0

                name += transNames[transIdx]
                transIdx += 1
                if (transIdx === 6)
                    transIdx = 0
                // app.queryName = "CLD_AP_"+tmp + vId
                app.queryName = name + tmp + "_" +vId
                state.applications.push(app);
                state.applicationMap.set(app.aid, app);
            }
        });
    },
    loadStaticTDAGDataToApp(state, {aid, tdagData}) {
        const {tasks, diagnose, stepInfo, counters} = tdagData;
        const app = state.applicationMap.get(aid);
        loadStaticTasks(app, tasks);
        loadStaticTaskStepInfo(app, stepInfo);
        loadStaticDiagnose(app, diagnose);
        loadStaticCounters(app, counters);
    },
    loadStaticExecutionDataToApp(state, {aid, executionData}) {
        const {records, abnormal_transfer, map_trans} = executionData;
        const app = state.applicationMap.get(aid);
        loadStaticRecords(app, records);
        loadStaticAbnormalTransfers(app, abnormal_transfer);
        loadStaticMapTransfers(app, map_trans);
    },
    cacheTransferList(state, {aid, tid, transferList}) {
        const app = state.applicationMap.get(aid);

        const srcTasks = [], dstTasks = [];
        transferList.forEach(tran => {
            if (tran.dir === 'out') {
                dstTasks.push(app.taskMap.get(tran.dst));
            } else {        // assert(tran.dir === 'in')
                if (tran.src !== undefined) {
                    srcTasks.push(app.taskMap.get(tran.src));
                } else {        // tran.srcV !== undefined
                    const srcVertex = app.vertexMap.get(tran.srcV);
                    srcTasks.push(...srcVertex.tasks);
                }
            }
        });

        app.transferCache.add(tid, srcTasks, dstTasks);
    },


    addSelectedApp(state, aid) {
        const app = state.applicationMap.get(aid);
        if (!state.selectedApps.includes(app)) {
            state.selectedApps.push(app)
        }



        // state.appShowingTask = state.applicationMap.get(appName)
        // setTimeout(() => {
        //     state.selectedApps.forEach(app => this.commit('comparison/layoutAppTDAG', app))
        // }, 0)
    },
    removeSelectedApp(state, aid) {
        const app = state.applicationMap.get(aid)
        state.selectedApps.splice(state.selectedApps.indexOf(app), 1)
        if (state.appShowingTask === app) {
            this.commit('comparison/changeAppShowingTask', null);
        }
        // if (state.selectedApps.length > 0)
        //     state.appShowingTask = state.selectedApps[state.selectedApps.length - 1]
        // setTimeout(() => {
        //     state.selectedApps.forEach(app => this.commit('comparison/layoutAppTDAG', app))
        // }, 0)
    },

    initTDAGView(state, {app}) {
        app.tdagModel = new TDAGModel(app);
        app.tdagModel.loadStatic();
        app.tdagModel.resizeXScale(state.tdagViewWidth);
        layoutTDAG(app.tdagModel);
        app.signs.tdagRender ^= 1;
        app.renderAxis ^= true;

        // let dg = state.groupDomain
        // state.groupDomain[0] = d3.min([dg[0], app.tdagModel.xScale.domain()[0]])
        // state.groupDomain[1] = d3.max([dg[1], app.tdagModel.xScale.domain()[1]])
        // state.groupedAppDomain.set(app.aid,app.tdagModel.xScale.domain())
    },

    updateTDAGView(state, {app:app,newVal:newV}) {
        if (newV) {
            app.tdagModel.globalTimeUpdate(state.groupDomain[1])
        }else{
            app.tdagModel.globalTimeUpdate(app.tdagModel.endTime)
        }
        layoutTDAG(app.tdagModel)
    },

    updateGroupedDomain(state,{app, newVal:newV, zoomXRatio: zoomXRatio, paintLenRatio: paintLenRatio}){
      if (!newV){
          state.groupedAppDomain.delete(app.aid);
      }else{
          state.groupedAppDomain.set(app.aid,app.tdagModel.xScale.domain());
      }
      let dg = [0,0];
      let zoomScale = app.tdagModel.zoomScale;
      // let appPaintLen = paintLenRatio * app.tdagModel.xScale.rang
      Array.from(state.groupedAppDomain.entries()).forEach(entry => {
              let [aid, domain] = entry;
              dg[0] = d3.min([dg[0], domain[0]]);
              dg[1] = d3.max([dg[1], domain[1]]);

              let app = state.applicationMap.get(aid);
              let curRange = app.tdagModel.xScale.range();
              let baseXScaleRange = app.tdagModel.baseXScaleRange[1];
              if (zoomScale >= 0){
                  app.tdagModel.updateXScaleRange(curRange[0], baseXScaleRange + zoomScale * baseXScaleRange)
              }
              else {
                  app.tdagModel.updateXScaleRange(curRange[0], baseXScaleRange * Math.pow(2, zoomScale))
              }
              state.applicationMap.get(aid).tdagModel.zoomScale = zoomScale;
              app.tdagModel.zoomXRatio = zoomXRatio;
              app.tdagModel.paintLenRatio = paintLenRatio
          }
      );
      state.groupDomain = dg;
      state.globalDomainUpdate ^= 1
    },

    changeTdagViewWidth(state, tdagViewWidth) {
       state.tdagViewWidth = tdagViewWidth;
    },

    changeAppShowingTask(state, aid) {
        if (aid === null) {
            state.appShowingTask = null;
            return;
        }
        const app = state.applicationMap.get(aid);
        state.appShowingTask = app;
        console.log('current app', app)

        this.commit('comparison/staticLoadTreeModel', aid);
        app.signs.taskListSign ^= 1;
        this.commit('comparison/staticLoadMatrixModel', aid);
        app.signs.matrixSign ^= 1;
    },

    staticLoadTreeModel(state, aid) {
        const app = state.applicationMap.get(aid);
        if (app.treeModel != null) {
            return;
        }
        app.treeModel = new TreeModel(app);
        app.treeModel.loadStatic(LayoutConfig.unitHeight, LayoutConfig.detailHeight);
    },

    staticLoadMatrixModel(state, aid) {
        const app = state.applicationMap.get(aid);
        if (app.mainTaskMatrixModel != null) {
            return;
        }
        app.mainTaskMatrixModel = new TaskMatrixModel(app, null);
        app.mainTaskMatrixModel.loadStatic();
        app.taskMatrixModels = app.machines.map(m => new TaskMatrixModel(app, m));
        app.taskMatrixModels.forEach(model => model.loadStatic());

        app.computeTransferMaxCSize();
    },

    switchPlaybackStatus(state, aid) {
        const app = state.applicationMap.get(aid);
        switch (app.animationStatus) {
            case AnimationStatus.NONE:
                app.animationStatus = AnimationStatus.RUNNING;
                app.resetForAnimation(state.tdagViewWidth);
                app.ackTime = 0;
                app.ackRealTime = new Date();
                app.timeHandlerId = setInterval(() => {
                    this.dispatch("comparison/queryUpdate", aid);
                }, app.updateRate);
                break;
            case AnimationStatus.RUNNING:
                app.animationStatus = AnimationStatus.PAUSE;
                clearInterval(app.timeHandlerId);
                app.timeHandlerId = null;
                app.pauseRealTime = new Date();
                break;
            case AnimationStatus.PAUSE:
                app.animationStatus = AnimationStatus.RUNNING;
                const pauseDuration = new Date() - app.pauseRealTime;       // ms
                const timeOutSec = app.updateRate + pauseDuration - (new Date() - app.ackRealTime);
                app.ackRealTime.setMilliseconds(app.ackRealTime.getMilliseconds() + pauseDuration);
                setTimeout(() => {
                    app.timeHandlerId = setInterval(() => {
                        this.dispatch("comparison/queryUpdate", aid);
                    }, app.updateRate);
                }, timeOutSec);
                break;
        }
    },
    stopPlayback(state, {aid, toReload}) {
        const app = state.applicationMap.get(aid);
        app.animationStatus = AnimationStatus.NONE;
        clearInterval(app.timeHandlerId);
        app.timeHandlerId = null;
        if (toReload) {
            this.dispatch('comparison/getStaticTDAGData', aid).then(() => {
                this.commit('comparison/initTDAGView', {app});
                this.dispatch('comparison/getStaticExecutionData', aid).then(() => {
                    if (app === state.appShowingTask) {
                        app.treeModel = null;
                        this.commit('comparison/staticLoadTreeModel', aid);
                        app.signs.taskListSign ^= 1;

                        app.mainTaskMatrixModel = null;
                        app.taskMatrixModels = [];
                        this.commit('comparison/staticLoadMatrixModel', aid);
                        app.signs.matrixSign ^= 1;
                    }
                })
            })
        }
    },
    changeAnimationParam(state, {aid, nextAckTime, nextAckRealTime}) {
        const app = state.applicationMap.get(aid);
        app.ackTime = nextAckTime;
        app.ackRealTime = nextAckRealTime;
    },
    handleUpdateData(state, {aid, updateData}) {
        const app = state.applicationMap.get(aid);

        const {
            app_status: appStatus,
            records, events,
            new_tasks: newTasks,
            abnormal_transfer: abnormalTransferList,
            counters
        } = updateData;

        if (appStatus === 'F') {        // finished
            this.commit('comparison/stopPlayback', {aid, toReload: false});
        } else {
            loadDynamic(app, newTasks, events, records, abnormalTransferList, counters);
            layoutTDAG(app.tdagModel, true);
            app.signs.taskListSign ^= 1;
            app.signs.matrixSign ^= 1;
        }
    },

    // interaction
    /**
     * @param state
     * @param {Application} app
     * @param {Vertex} vertex
     * @param {boolean} toHighlight
     */
    changeHighlightVertex(state, {app, vertex, toHighlight}) {
        changeHighlightVertex(app, vertex, toHighlight);
        this.commit('comparison/updateTaskMatrixHighlight', {app});
    },
    /**
     * @param state
     * @param {Application} app
     * @param {Task} task
     * @param {boolean} toHighlight
     */
    changeHighlightTask(state, {app, task, toHighlight}) {
        changeHighlightTask(app, task, toHighlight);
        this.commit('comparison/updateTaskMatrixHighlight', {app});
    },
    updateTaskMatrixHighlight(state, {app}) {
        if (app.mainTaskMatrixModel && app.showOverviewMatrix) {
            app.mainTaskMatrixModel.updateHighlightPoints();
            app.mainTaskMatrixModel.updateHighlightTransfers();
        }
        app.taskMatrixModels.forEach(model => {
            if (app.selectedMachines.includes(model.machine.machineName)) {
                model.updateHighlightPoints();
                model.updateHighlightTransfers();
            }
        });
    },

    changeTaskTooltipTask(state, task) {
        if (task) {
            state.tooltipData.setTask(task);
        } else {
            state.tooltipData.clearTask();
        }
    },

    updateTaskListHighlight(state, app) {
        app.signs.taskListHighlightSign ^= 1;
    },
    updateDiagnoseHighlight(state, app) {
        app.signs.diagnoseHighlightSign ^= 1;
    },

    handleTDAGNodeClick(state, {app, vertex}) {
        if (vertex._treeViewObj) {
            vertex._treeViewObj.config.outerSelect = true;
            vertex._treeViewObj.machineTreeModelList.forEach(machineTreeModel => {
                machineTreeModel.config.outerSelect = true;
            });
        }
    },

    handleTDAGNodeClickCancel(state, {app, vertex}) {
        if (vertex._treeViewObj) {
            vertex._treeViewObj.config.outerSelect = false;
            vertex._treeViewObj.machineTreeModelList.forEach(machineTreeModel => {
                machineTreeModel.config.outerSelect = false;
            });
        }
    },

    // -----------------------------

    simulationChangeShowingApp(state, app) {
        state.appShowingTask = app;
    },

    changeRenderSign(state, app) {
        // wait a cycle for element creation
        setTimeout(() => app.changeRenderSign(), 0)
    },

    updateTDAGScale(state, {app, width, height}) {
        state.layoutConfig.width = width;
        state.layoutConfig.height = height - state.layoutConfig.marginTop;
        app.xScale.range([state.layoutConfig.marginLeft, state.layoutConfig.width - state.layoutConfig.marginRight]);
    },

    initAppTasks(state, {app, tasks}) {
        // loadTasksToApp(state, app, tasks)
    },

    initialAppDiagnoseMatrix(state, {app, diagnoseMatrix}) {
        app.diagnoseMatrix = diagnoseMatrix
    },
    changeTaskLoadedStatus(state, status) {
        state.taskLoaded = status
    },
    layoutAppTDAG(state, app) {
        if (app === undefined) {
            return
        }
        let maxDuration = 0;
        if (state.selectedApps.length > 0 && state.selectedApps[0] !== undefined) {
            maxDuration = Math.max(...state.selectedApps.map(app => app.vMaxTime - app.minTime))
        } else {
            maxDuration = app.vMaxTime - app.minTime;
        }
        maxDuration *= 1.05;
        layoutTDAG(state, app, maxDuration)
        app.renderAxis ^= true
    },

    estimationIncrementalContainerHeight(state, nVertex) {
        // state.LayoutConfig.vertexContainerHeight = Math.max((state.LayoutConfig.height - state.LayoutConfig.marginTop) / nVertex, 45);
        // state.LayoutConfig.vertexContainerHeight = Math.min(20, state.LayoutConfig.vertexContainerHeight);
        //
        // state.LayoutConfig.vertexHeight = (state.LayoutConfig.vertexContainerHeight - 8) * 0.8
        //
        // console.log('update', state.LayoutConfig)
    },

    updateMonData(state, {app, monData}) {
        for (let machineId in monData) {
            let monList = monData[machineId]
            if (app.monData[machineId] === undefined) {
                app.monData[machineId] = monList
            } else {
                let monData = app.monData[machineId]
                monList.forEach(item => monData.push(item))
            }
        }
        for (let machineId in app.monData) {
            if (app.machineMap[machineId]) {
                app.machineMap[machineId]['status'] = app.monData[machineId]
                // console.log('>>', app.machineMap[machineId]['status'].length)
            }
        }

        // update disk Max value
        let diskNames = Object.keys(app.metrics.diskMax);
        let metrics = app.metrics.diskMetric;
        if (Object.values(monData).length > 0) {
            metrics.forEach(metric => {
                diskNames.forEach(diskName => {
                    app.metrics.diskMax[diskName][metric] = d3.max(Object.values(monData),
                        machineValue => d3.max(machineValue, d => d.iostat[diskName] == undefined ? 0 : d.iostat[diskName][metric]))
                })
            })
        }
        // update netIO maxValue

        let netMetrics = app.metrics.netIO;
        if (Object.values(monData).length > 0) {
            netMetrics.forEach(metric => {
                app.metrics.netIOMax[metric] = d3.max(Object.values(monData),
                    machineValue => d3.max(machineValue, d => d.netIO[metric]))
            })
        }
    },

    updateFetch(state, {app, changes, maxCSize, fetchGlyphs}) {
        // app.fetchData = changes;
        app.maxCSize = maxCSize;

        app.abnormalDeps = fetchGlyphs;
        // changes.forEach(fetchInfo => {
        //     app.fetchData.push(fetchInfo)
        // })
    },

    changeShowDataflow(state, {app, showDataflow}) {
        app.showDataflow = showDataflow
    },
    processDataFlow(state, {app, changes, maxCSize, fetchGlyphs}) {
        function addSrcDstTask(srcTask, dstTask, app) {
            let srcTaskMap = app.depTaskMaps.srcTaskMap, dstTaskMap = app.depTaskMaps.dstTaskMap
            if (!srcTaskMap[dstTask.task_id]) {
                srcTaskMap[dstTask.task_id] = {}
            }
            if (!srcTaskMap[dstTask.task_id][srcTask.task_id]) {
                srcTaskMap[dstTask.task_id][srcTask.task_id] = srcTask
            }
            if (!dstTaskMap[srcTask.task_id]) {
                dstTaskMap[srcTask.task_id] = {}
            }
            if (!dstTaskMap[srcTask.task_id][dstTask.task_id]) {
                dstTaskMap[srcTask.task_id][dstTask.task_id] = dstTask
            }
        }

        function addSrcDstDep(srcTask, dstTask, dep, app) {
            let srcDepMap = app.depTaskMaps.srcDepMap, dstDepMap = app.depTaskMaps.dstDepMap
            // -------------- src
            if (!srcDepMap[dstTask.task_id]) {
                srcDepMap[dstTask.task_id] = {}
            }
            if (!srcDepMap[dstTask.task_id][dep.dep_id]) {
                srcDepMap[dstTask.task_id][dep.dep_id] = dep
            }
            // -------------- dst
            if (!dstDepMap[srcTask.task_id]) {
                dstDepMap[srcTask.task_id] = {}
            }
            if (!dstDepMap[srcTask.task_id][dep.dep_id]) {
                dstDepMap[srcTask.task_id][dep.dep_id] = dep
            }
        }

        changes.forEach(dict => {
            if (dict.label === 'NORMAL') {
                dict.srcTask = app.taskMap[dict.src];
                dict.dstTask = app.taskMap[dict.dst];
                //  add depMap
                addSrcDstTask(dict.srcTask, dict.dstTask, app)
            } else {
                // src are all tasks from srcVtxName
                dict.srcTasks = app.vertexMap[dict.srcVtxName].tasks
                dict.dstTask = app.taskMap[dict.dst];
                dict.srcTasks.forEach(srcTask => {
                    addSrcDstTask(srcTask, dict.dstTask, app)
                })
            }
        })
        // app.dataFlow = app.fetchData


        // process data flow, used in TaskMatrix

        // let maxCSize = 0
        // app.dataFlow.forEach((d) => {
        //   if (d.label === 'NORMAL') {
        //     maxCSize = Math.max(maxCSize, d.csize)
        //   } else {
        //     d.srcTasks.forEach(srcTask => {
        //       let srcTaskCounters = app.counters[srcTask['task_id']]//?
        //       maxCSize = Math.max(maxCSize, srcTaskCounters['OUTPUT_BYTES'])
        //     })
        //   }
        // })
        // app.maxCSize = maxCSize


        app.abnormalDeps.forEach((fetchGlyph) => {
            fetchGlyph.srcTask = app.taskMap[fetchGlyph.srcTask]
            fetchGlyph.dstTask = app.taskMap[fetchGlyph.dstTask]
            addSrcDstDep(fetchGlyph.srcTask, fetchGlyph.dstTask, fetchGlyph, app)
        })
    },

    changeDataNames(state, dataNames) {
        state.dataNames = dataNames;
    },

    changeSqlData(state, {app, sql}) {
        app.sqlData = sql
    },

    changeAppInfo(state, {app, info}) {
        app.appInfo = info
    },

    changeInLoading(state, inLoading) {
        state.inLoading = inLoading
        state.finishLoading = !inLoading
    },

    changeTDAGCursorMode(state, {app, mode}) {
        app.tdagCursorMode = mode
    },

    computeVisGraph(state, app) {
        console.log("computeVisGraph", app)
        app.visGraph = new VisHierarchyGraph(app.hGraph, {
            dagRoot: app.dagRoot,
            gapPixel: state.gapPixel,
            orderMap: (() => {
                let orderMap = new Map()
                Object.keys(app.orderMap).forEach(vertexName => {
                    orderMap.set(vertexName, app.orderMap[vertexName])
                })
                return orderMap
            })(),
            vertexContainerHeight: state.layoutConfig.vertexContainerHeight,
            marginTop: state.layoutConfig.marginTop,
        })
        console.log('marginTop', state.layoutConfig.marginTop)
        app.visGraph.computeStepLayout(app.vertexMap, xScale, state.layoutConfig)
    },

    // handleTDAGNodeClick(state, {app, node}) {
    //     console.log("handleTDAGNodeClick", app)
    //     const aggrNode = node.data.hGraphNode.data
    //     console.log(node, aggrNode)
    //     switch (app.tdagCursorMode) {
    //         case TDAGCursorMode.NORMAL:
    //             break;
    //         case TDAGCursorMode.UNFOLD:
    //             app.hGraph.expandNode(aggrNode)
    //             this.commit('comparison/computeVisGraph', app)
    //             // state.updateTDADGSign ^= true
    //             break;
    //         case TDAGCursorMode.FOLD:
    //             if (aggrNode.parent) {
    //                 app.hGraph.aggregateNodeByParent(aggrNode.parent)
    //                 this.commit('comparison/computeVisGraph', app)
    //                 // state.updateTDADGSign ^= true
    //             } else {
    //                 console.warn('can not aggregate root')
    //             }
    //             break;
    //     }
    // },

    changeHighlightByTask(state, {app, vertices, type, value}) {
        vertices.forEach(vertexName => {
            const node = app.visGraph.vertexName2Node.get(vertexName)
            node.data.layout[type] = value
        })
    },

    changeTDAGTransform(state, {app, transform}) {
        // state.selectedApps.forEach(application => {
        //   application.tdagTransform = transform
        // })
        state.lastMove = app
        state.tdagTransform = transform
        // console.log(state.tdagTransform)
    },

    changeSelectStatusInTaskList(state, {app, task, selected}) {
        app.treeModel.changeSelectStatus(task, selected);
    },

    // ------------- useless functions

    updateSelectTimeScale(state, range) {
        if (range == undefined || range.length != 2) {
            state.minTime = state.absMinTime;
            state.maxTime = state.absMaxTime;
            console.log('mutation', state.maxTime, state.minTime);
        } else {
            state.minTime = range[0];
            state.maxTime = range[1];
        }

        state.renderSign = !state.renderSign
    },
    updateTaskView(state, tasks) {
        if (tasks == undefined) {
            state.selectTaskList = state.taskList;
        } else {
            state.selectTaskList = tasks;
        }
    },
    // initIncrementalViewData(state) {
    //     state.taskNames = []
    //     state.vertexNameMap = {}
    //     state.vertexes = []
    //     state.renderEdges = []
    //
    //     state.vtxLaneMap = {}
    //
    //     state.monData = {}
    //     state.counters = {}
    //     state.fetchData = []
    //     state.fetchEndMap = {}
    //     state.outlierData = {}
    //
    //     state.transmitData = {}
    //
    //     state.maxCSize = 0
    // },

    updateLayout(state) {
        // Layout all nodes
        // let startTime = state.vertexes[0].startTime;
        // let endTime = state.vertexes[state.vertexes.length - 1].endTime;
        let startTime = d3.min(state.vertexes, vertex => vertex.startTime);
        let endTime = d3.max(state.vertexes, vertex => vertex.endTime);
        state.startTime = startTime
        if (endTime > state.endTime) {
            state.endTime = (endTime - startTime) * 1.2 + startTime;
            state.xScale.domain([startTime, state.endTime]);
            mXScale.domain([startTime, state.endTime]);
            mYScale.domain([startTime, state.endTime]);

            state.matrixDiagMin.x = mXScale(startTime);
            state.matrixDiagMin.y = mYScale(startTime);
            state.matrixDiagMax.x = mXScale(state.endTime);
            state.matrixDiagMax.y = mYScale(state.endTime);

        }

        /* layout */
        let mstAggregate = function mstAggregate() {
            // get ready for the layout algo
            let graph = new Graph()
            Object.keys(state.vertexMap).forEach(vtxName => {
                let vertex = state.vertexMap[vtxName]
                let vld = new VertexLayoutData(state.xScale(vertex.startTime),
                    state.xScale(vertex.endTime), 0,
                    vtxName.charAt(0) + vtxName.match(/.* (\d*)/)[1], [vtxName])
                graph.addNode(vtxName, vld)
            })
            Object.keys(state.childrenMap).forEach(vtxName => {
                let children = state.childrenMap[vtxName]
                children.forEach(child => graph.addEdge(child, vtxName))
            })
            let orderMap = new Map()
            Object.keys(state.orderMap).forEach(vertexName => {
                orderMap.set(vertexName, state.orderMap[vertexName])
            })


            let tlAggrAlgo = new TLAggrAlgo(graph)
            console.log(tlAggrAlgo)
            tlAggrAlgo.solve()

            return tlAggrAlgo.hGraph

        }
        // state.mstAggrGraph = mstAggregate()
        state.hGraph = mstAggregate()
        this.commit('comparison/computeVisGraph',)

        /* layout - end */

        // state.vertexes.forEach(vertex => {
        //   // let _widtj=
        //   let layout = {};
        //   if (vertex.layout.x == 0) {
        //     vertex.layout.x = state.xScale(vertex.startTime);
        //     vertex.layout.mX = mXScale(vertex.startTime);
        //   } else {
        //     layout.x = state.xScale(vertex.startTime);
        //     layout.mX = mXScale(vertex.startTime);
        //   }
        //   layout.width = state.xScale(vertex.endTime) - state.xScale(vertex.startTime);
        //   let laneIdx = state.vtxLaneMap[vertex.vertexName]
        //   if (vertex.layout.y == 0) {
        //     vertex.layout.y = laneIdx * state.LayoutConfig.vertexContainerHeight + state.LayoutConfig.marginTop;
        //     vertex.layout.mY = mYScale(vertex.endTime);
        //   } else {
        //     layout.y = laneIdx * state.LayoutConfig.vertexContainerHeight + state.LayoutConfig.marginTop;
        //     layout.mY = mYScale(vertex.endTime);
        //   }
        //   let startX = 0;
        //   // let stepLayout = []
        //   let sumVal = d3.sum(vertex.steps);
        //   TweenLite.to(vertex.layout, state.updateRate / 1000, layout)
        //   vertex.steps.forEach((step, j) => {
        //     let stepWidth = sumVal == 0 ? 0 : (step / sumVal * layout.width);
        //     let stepLayoutObj = {
        //       x: startX,
        //       width: stepWidth,
        //       id: j,
        //       fill: state.LayoutConfig.stepColors[j],
        //       name: state.LayoutConfig.stepName[vertex.hvType][j]
        //     }
        //     if (vertex.stepLayout.length < vertex.steps.length) {
        //       vertex.stepLayout.push(stepLayoutObj)
        //     } else {
        //       TweenLite.to(vertex.stepLayout[j], state.updateRate / 1000, stepLayoutObj);
        //     }
        //     // stepLayout.push(stepLayoutObj)
        //     startX += stepWidth;
        //   });
        //   // vertex.stepLayout = stepLayout;
        //   layout.height = state.LayoutConfig.vertexHeight;
        // })
        //
        // state.renderSign = !state.renderSign
    },

    updateOutlierData(state, data) {
        state.outlierData = data
    },
    fixTaskStepInfo(state, taskList) {
        taskList.forEach(task => {
            state.taskMap[task.task_id].step_info = task.step_info
        })
    },
    updateCounters(state, {taskId, counter}) {
        state.counters[taskId] = counter
    },
    // must have full fetch data. when call this, processDataFlow has been called
    computeTransmission(state) {
        console.log('compute transmitMap start')

        let transmitMap = {}
        let transmitted = new Set()         // set of transmitted vertex for ALL label
        let machineIdxMap = {}
        state.machineList.forEach((machine, i) => machineIdxMap[machine.machineId] = i)
        let machineCnt = Object.keys(machineIdxMap).length
        if (machineCnt === 0) {
            return
        }
        state.fetchData.forEach(fetchInfo => {
            let dstVtxName = fetchInfo.dstTask.vec_name,
                dstMachine = fetchInfo.dstTask.machine_id
            let dstMachineIdx = machineIdxMap[dstMachine]

            if (fetchInfo.label === 'NORMAL') {
                let srcVtxName = fetchInfo.srcTask.vec_name,
                    srcMachine = fetchInfo.srcTask.machine_id
                let srcMachineIdx = machineIdxMap[srcMachine]

                let tsmSrc = getOrSetIfMiss(transmitMap, srcVtxName, {})
                let tsmSrcDst = getOrSetIfMiss(tsmSrc, dstVtxName, [])

                if (tsmSrcDst.length === 0) {       // init if is []
                    for (let i = 0; i < machineCnt; i++) {
                        let row = []
                        for (let j = 0; j < machineCnt; j++) {
                            row.push(0)
                        }
                        tsmSrcDst.push(row)
                    }
                }
                tsmSrcDst[srcMachineIdx][dstMachineIdx] += fetchInfo.csize
                state.maxCSize = Math.max(state.maxCSize, fetchInfo.csize)

            } else {        // is ALL
                let srcVtxName = fetchInfo.srcVtxName
                if (!transmitted.has(srcVtxName)) {
                    fetchInfo.srcTasks.forEach(srcTask => {
                        let srcVtxName = srcTask.vec_name,
                            srcMachine = srcTask.machine_id
                        let srcMachineIdx = machineIdxMap[srcMachine]

                        let tsmSrc = getOrSetIfMiss(transmitMap, srcVtxName, {})
                        let tsmSrcDst = getOrSetIfMiss(tsmSrc, dstVtxName, [])

                        if (tsmSrcDst.length === 0) {       // init if is []
                            for (let i = 0; i < machineCnt; i++) {
                                let row = []
                                for (let j = 0; j < machineCnt; j++) {
                                    row.push(0)
                                }
                                tsmSrcDst.push(row)
                            }
                        }
                        let srcTaskCounters = state.counters[srcTask['task_id']]
                        let size = srcTaskCounters['OUTPUT_BYTES']
                        tsmSrcDst[srcMachineIdx][dstMachineIdx] += size
                        state.maxCSize = Math.max(state.maxCSize, size)
                    })
                    transmitted.add(srcVtxName)
                }
            }
        })
        state.transmitData = transmitMap

        console.log('fetchData: %o', state.fetchData)
        console.log('transmitData: %o', state.transmitData)
    },
    // save task recv into task obj. {machineId: [recv]}
    computeTaskRecvSend(state) {
        state.fetchData.forEach(fetchInfo => {
            let dstTask = state.taskMap[fetchInfo.dst],
                dstMachine = fetchInfo.dstTask.machine_id
            let recvMap = getOrSetIfMiss(dstTask, 'recv', {})

            if (fetchInfo.label === 'NORMAL') {
                let srcTask = state.taskMap[fetchInfo.src],
                    srcMachine = fetchInfo.srcTask.machine_id
                let sendMap = getOrSetIfMiss(srcTask, 'send', {})

                getOrSetIfMiss(recvMap, srcMachine, []).push(fetchInfo)
                getOrSetIfMiss(sendMap, dstMachine, []).push(fetchInfo)

            } else {        // is ALL
                fetchInfo.srcTasks.forEach(srcTask => {
                    let srcMachine = srcTask.machine_id
                    let sendMap = getOrSetIfMiss(srcTask, 'send', {})

                    let srcTaskCounters = state.counters[srcTask['task_id']]
                    let size = srcTaskCounters['OUTPUT_BYTES']

                    let genFetchData = {
                        ...fetchInfo,
                        csize: size,
                        src: srcTask.task_id,
                        srcTask,
                    }
                    delete genFetchData['srcTasks']
                    delete genFetchData['srcVtxName']

                    getOrSetIfMiss(recvMap, srcMachine, []).push(genFetchData)
                    getOrSetIfMiss(sendMap, dstMachine, []).push(genFetchData)
                })
            }
        })
        console.log('after set recv / send, taskList: %o', state.taskList)
    },

    trgFinishLoading(state) {
        state.finishLoading = true
    },
    changeTimeHandler(state, {timeHandler}) {
        state.timeHandler = timeHandler
    },
    changeSimRate(state, simRate) {
        state.simRate = simRate
    },
    changeSimRunning(state, running) {
        state.simRunning = running
    },
    changeMonRunning(state, running) {
        state.monRunning = running
    },
    changeSimDataName(state, simDataName) {
        state.simDataName = simDataName
    },
    changeShowCompound(state, showCompound) {
        state.showCompound = showCompound
    },
    changeMergeCount(state, mergeCount) {
        state.mergeCount = mergeCount
    },

    updateTaskScale(state, region) {
        mXScale.range([matrixLayoutCOnfig.marginLeft, region.width - matrixLayoutCOnfig.marginRight]);
        mYScale.range([matrixLayoutCOnfig.marginTop, region.height - matrixLayoutCOnfig.marginBottom]);
        matrixLayoutCOnfig.upperHeight = region.upperHeight;
    },

    getTaskCountByTaskList(state, tasks) {
        let usage = [];
        let trend = [];
        let count = 0;
        tasks.forEach(task => {
            usage.push({'type': 'start', 'time': task.start_time});
            usage.push({'type': 'end', 'time': task.end_time});
        })
        usage.sort((a, b) => (a.time > b.time) ? 1 : -1);

        usage.forEach(u => {
            if (u.type == 'start') {
                count += 1;
            } else if (u.type == 'end') {
                count -= 1;
            } else {
                console.log('error type')
            }
            if (trend.length > 0 && trend[trend.length - 1].time == u.time) {
                trend[trend.length - 1].count = count;
            } else {
                trend.push({'time': u.time, 'count': count})
            }
        })

        let _render = [];
        trend.forEach((u, i) => {
            if (i != 0) {
                _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
            }
            _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
        })
        state.selectTaskCount = dLine(_render);
    },
    hoverVertex(state, vertex) {
        if (typeof vertex == 'string') {
            vertex = state.vertexMap[vertex]
        }
        if (vertex == undefined) {
            return
        }
        vertex.layout.selected = true;
        state.vertexes.forEach(vertex => {
            vertex.tasks.forEach(task => {
                task.layout.selected = false;
            })
        })
        vertex.tasks.forEach(task => {
            task.layout.selected = true;
        })

        let startTimeRange = d3.extent(vertex.tasks, task => task.start_time);
        let endTimeRange = d3.extent(vertex.tasks, task => task.end_time);

        // should be put together

        state.timeSelection.startTime = state.timeSelection.minStartTime = startTimeRange[0];
        state.timeSelection.maxStartTime = startTimeRange[1];
        state.timeSelection.minEndTime = endTimeRange[0];
        state.timeSelection.endTime = state.timeSelection.maxEndTime = endTimeRange[1];


        this.commit('simulation/getTaskCountByTaskList', vertex.tasks);
    },
    hoverOutVertex(state, vertex) {
        if (typeof vertex == 'string') {
            vertex = state.vertexMap[vertex]
        }
        if (vertex == undefined) {
            return
        }
        vertex.layout.selected = false;
        vertex.tasks.forEach(task => {
            task.layout.selected = false;
        })

        state.machineList.forEach(machine => machine.selectTaskCount = "")
        // should be put together
        state.timeSelection.startTime = -1;
        state.timeSelection.endTime = -1;
        state.timeSelection.x1 = 0;
        state.timeSelection.x2 = 0;
        state.timeSelection.y1 = 0;
        state.timeSelection.y2 = 0;
    },
    selectVertex(state, vertex) {

        if (vertex == state.selectedVertex) {
            state.selectedVertex = null;
        } else {
            state.selectedVertex = vertex;
        }

    },

    changeLoadingStatus(state, {loadingStatus}) {
        state.isLoading = loadingStatus
    },

    changeAppShowingTaskOverviewMatrix(state) {
        if (state.appShowingTask.selectedMachineMetrics.length < 0)
            return
        state.perfCellClick = true
        state.appShowingTask.overviewMatrix = !state.appShowingTask.overviewMatrix
    },

    changeAppShowingTaskSelectedMachine(state, machineName) {
        if (state.appShowingTask.selectedMachineMetrics.length < 0)
            return
        state.perfCellClick = true
        let tmp = {}
        for (let machine in state.appShowingTask.selectedMachineMetrics) {
            tmp[machine] = state.appShowingTask.selectedMachineMetrics[machine]
        }
        tmp[machineName] = !tmp[machineName]
        state.appShowingTask.selectedMachineMetrics = tmp
    },

    changeAppShowingAllTaskMachine(state) {
        let tmp = {}
        for (let machine in state.appShowingTask.selectedMachineMetrics) {
            tmp[machine] = !state.appShowingTask.selectedMachineMetrics[machine]
        }
        state.appShowingTask.selectedMachineMetrics = tmp
    },

    changeTaskTooltipData(state, tooltipData) {
        state.tooltipData = Object.assign({}, state.tooltipData, tooltipData);
    }

}

export default {
    namespaced: true,
    state,
    actions,
    mutations
}
