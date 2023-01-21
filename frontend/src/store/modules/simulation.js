/* eslint-disable */

import * as d3 from "d3";
import TweenLite from "gsap";
import dataService from "@/service/dataService2";
import {Graph} from "@/utils/utils/graph";
import {VertexLayoutData} from "@/utils/entities/VertexLayoutData";
import {GreedyLayoutAlgo} from "@/utils/algo/greedy-tdag-layout/GreedyLayoutAlgo";
import {TLAggrAlgo} from "@/utils/algo/tl-aggregation/TLAggreAlgo";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";
import {initApplication} from "@/utils/application-utils/AppInitializer";
import {layoutTDAG} from "@/utils/application-utils/TDAGLayout";
import {loadTaskEventsToApp, loadTasksToApp} from "@/utils/application-utils/TaskLoader";


const metrics = {
    netIO: ['bytesRecv', 'bytesSent', 'dropin', 'dropout', 'errin', 'errout', 'packetsRecv', 'packetsSent'],
    diskMetric: ['avgquSz', 'avgrqSz', 'await', 'rAwait', 'rkBs', 'rrqms', 'rs', 'wAwait', 'wkBs', 'wrqms', 'ws'],
    diskMax: {'dm-0': {}, loop: {}, sdb: {}},
    netIOMax: {}

}

metrics.diskMetric.forEach(metric => {
    metrics.diskMax['dm-0'][metric] = 0;
    metrics.diskMax.loop[metric] = 0;
    metrics.diskMax.sdb[metric] = 0;
})
metrics.netIO.forEach(metric => {
    metrics.netIOMax[metric] = 0;
})


// put them to where ?
const layoutConfig = {
    marginTop: 40,
    marginLeft: 20,
    marginRight: 20,
    vertexContainerHeight: 30,
    vertexHeight: 20,
    width: 1000,
    height: 800,

    stepColors2: [
        "rgba(181,123,203,0.46)",
        "rgba(224,143,146,0.45)",
        "rgba(85,98,172,0.55)",
        "rgba(245,224,150,0.73)",
        "rgba(194,228,195,0.73)",
    ],
    stepColors3: [
        "rgba(346, 70, 94,1)",
        "rgba(255, 209, 102,0.51)",
        "rgba(6, 214, 160,0.85)",
        "rgba(17, 138, 178,0.73)",
        "rgba(7, 59, 76,0.23)",
    ],
    stepColors4: [
        "rgba(38, 70, 83,1)",
        "rgba(42, 157, 143,1)",
        "rgba(233, 196, 106,1)",
        "rgba(244, 162, 97,1)",
        "rgba(231, 111, 81, 1)",
    ],
    stepColors: [
        "rgba(203,213,232,1)",
        "rgba(179,226,205,1)",
        "rgba(230,245,201, 1)",
        "rgba(244,202,228,1)",
        "rgba(253,205,172,1)",

    ],
    // stepColors: ["#1F77B4", "#FFA556",
    //     "#2CA02C", "#9467BD", "#EE6545"],
    // // stepColors2: ["#1776B6", "#FF7F00",
    //     "#24A221", "#d8241f", "#BCBF00"],
    outlierColors: ["#d92b2b", "#3469f8", "#e8e8e8"],
    stepName: {
        'Map': ["Initialization", "Input", "Processor", "Sink", "Spill"],
        'Reducer': ["Initialization", "Shuffle", "Processor", "Sink", "Spill"],
    }
}
// const LayoutConfig = Object.assign({}, LayoutConfig);

const xScale = d3.scaleLinear().range([layoutConfig.marginLeft, layoutConfig.width - layoutConfig.marginRight]);

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
    appMetaList: [],

    application: null,      //used for components-new

    dagRenderSign: 0,

    timeIntervalId: null,
    updateRate: 500,        // ms
    ackTime: 0,             // ms
    ackRealTime: null,
    startTime: -1,
    endTime: -1,

    finishSimulation: false,

    dagData: null,
    sqlData: null,
    fullTasks: null,

    vertexes: [],       // used in incr
    vertexMap: {},      // used in incr

    taskNames: [],      // used in incr

    simDataName: null,
    showDataflow: true,

    monData: {},        // monitor data for each machine
    counters: {},       // counter map for each task

    fetchData: [],      // fetch info from task to task.
    fetchEndMap: {},    // the finished input of task from a vertex. taskId -> list of vertexName

    outlierData: {},    // task id -> {v, vm}

    transmitData: {},       // srcVtxName -> dstVtxName -> {machines, n X n matrix}

    simRunning: false,
    monRunning: false,

    selectedVertex: null,
    // LayoutConfig: LayoutConfig,
    layoutConfig: Object.assign({}, layoutConfig),
    gapPixel: 25,       // the horizontal gasp between two vertex at same lane in data flow diagram

    // use to layout the vertexes
    orderMap: {},               // const
    orderedVertexIdx: [],       // const
    dagRoot: '',                // const
    childrenMap: {},           // const, parent vtxName -> list of children
    parentsMap: {},            // const, child vtxName -> list of parents
    vtxLaneMap: {},

    inLoading: false,        // is data flow diagram in loading (by press button)
    finishLoading: false,
    metrics: metrics,

    taskList: [],
    taskMap: {},
    taskCount: "",


    selectTaskList: [],


    machineList: [],
    machineMap: {},

    incTimeStep: 60 * 10,

    //Once this is changed, call all the render functions
    renderSign: true,

    selectTaskCount: "",
    timeSelection: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        startTime: -1,
        endTime: -1,
        minStartTime: -1,
        maxStartTime: -1,
        minEndTime: -1,
        maxEndTime: -1
    },

    matrixDiagMin: {x: 0, y: 0},
    matrixDiagMax: {x: 0, y: 0},

    edges: [],
    renderEdges: [],

    // below var are data of simulator in backend
    simRate: null,     // will update when page mounted

    absMaxTime: -1,
    abxMinTime: -1,
    minTime: -1,
    maxTime: -1,
    vMaxTime: -1,
    minTimeLength: Number.MAX_VALUE,
    maxTimeLength: -1,

    minDataSize: Number.MAX_VALUE,
    maxDataSize: -1,

    dataFlow: [],
    maxCSize: 0,        // max transfer size (only for fetch now)

    colorSchema: {
        'Map': "#1b9e77",
        'Reducer': "#D95F02",
        'selected': "purple",
        'MapFail': '#1b9e77',
        'ReducerFail': '#D95F02',
        'selectedFail': '#bb0000',

        'selectAsProvider': '#d55e5e',
        'selectCurrent': 'purple',
        'selectAsConsumer': '#3c76e5',
        'fetchHighlight': '#8c45dc',
    },

    // interaction start >>>>>>
    taskViewSelects: [],
    // interaction end <<<<<<<<

    // linkColorPool: d3.schemeCategory10,

    compoundGraph: null,
    mstAggrGraph: null,
    showCompound: false,

    hGraph: null,
    visGraph: null,
    updateTDADGSign: true,

    clusterNumber: 1,
    mergeCount: 0,
    /** @type {TDAGCursorMode} */
    tdagCursorMode: TDAGCursorMode.NORMAL,
    xScale: xScale
})

// getters
const getters = {
    // represent whether the simulator is running or not
    running: state => state.timeIntervalId != null,
}

// actions
const actions = {
    // // Start the simulator, if not running yet
    // startSimulator(context, dataName) {
    //     if (context.getters.running) {
    //         // running. must stop first
    //         return
    //     }
    //
    //     context.commit('initIncrementalViewData')   // clean incremental view data first
    //     dataService.startSimulator({dataName: dataName}, d => {
    //         console.log('start simulator. %o', d)
    //         context.commit('changeSimDataName', dataName)
    //         context.commit('changeShowDataflow', false)
    //         let doUpdate = function () {
    //             if (context.state.simRunning) {
    //                 context.dispatch('queryUpdate')
    //                 context.dispatch('queryFetchUpdate')
    //             }
    //             if (context.state.monRunning) {
    //                 context.dispatch('queryMonUpdate')
    //             }
    //         }
    //         let timeHandler = setInterval(doUpdate, context.state.updateRate);
    //         console.log('Set interval', timeHandler);
    //         context.commit('changeSimRunning', true)
    //         context.commit('changeMonRunning', true)
    //         context.commit('changeTimeHandler', {timeHandler})
    //     })
    // },
    //
    // // Stop the simulator, if is running
    // stopSimulator(context) {
    //     console.log('running: ', context.getters.running)
    //     if (!context.getters.running) {
    //         // is not running, do nothing
    //         return
    //     }
    //     // stop backend
    //     dataService.stopSimulator({}, resp => {
    //         console.log('stop simulator. %o', resp);
    //         console.log('simulation vertex', context.state);
    //         console.log('stopped machine', context.state.machineMap);
    //         context.commit('changeShowDataflow', true)
    //         // context.commit('processDataFlow');
    //         // context.commit('computeTransmission')
    //         // context.commit('computeTaskRecvSend')
    //
    //         dataService.queryFullTasks({name: context.state.simDataName}, d => {
    //             context.commit('fixTaskStepInfo', d.changed)
    //         })
    //
    //         dataService.queryFullOutliers({name: context.state.simDataName}, d => {
    //             console.log('queryFullOutliers: %o', d)
    //             context.commit('updateOutlierData', d)
    //         })
    //         context.commit('changeSimulationStatus', true)
    //
    //         console.log('results -----------111 ', context.state.counters)
    //         console.log('results -----------111 ', context.state.fetchData)
    //     })
    //     // stop frontend
    //     clearInterval(context.state.timeHandler)
    //     console.log('Clear interval', context.state.timeHandler);
    //     context.commit('changeSimRunning', false)       // for stop button click
    //     context.commit('changeMonRunning', false)
    //     context.commit('changeTimeHandler', {timeHandler: null})
    //
    // },
    getAppMetaList({commit}) {
        dataService.getAppMetaList({}, resp => {
            commit('changeAppMetaList', resp)
        })
    },
    getApplication({commit}, aid) {
        dataService.getApplicationByAid({
            aid,
            "query_plan": false,    // plan text is not needed
        }, resp => {
            commit('changeApplication', resp);
            dataService.getVertexListByAid({aid}, resp => {
                commit('loadVertexInformation', resp);
            });
        })
    },
    // Query the static dag data, using dataName
    queryDag(context, dataName) {
        dataService.queryDag({name: dataName}, resp => {
            context.commit("initialApp", {dataName, dagData: resp})
            console.log(context.state.application)
        })
    },

    // Query the static data, using dataName
    queryDirectlyLoad(context, dataName) {
        context.commit('changeInLoading', true)
        let finishedCnt = 4
        let finishedCheck = function () {
            finishedCnt -= 1
            if (finishedCnt <= 0) {
                context.commit('changeInLoading', false)
                context.commit('trgFinishLoading')
                // context.commit('computeTransmission')
                // context.commit('computeTaskRecvSend')
            }
        }

        dataService.queryFullTasks({name: dataName}, d => {
            console.log('queryFullTasks: %o', d)
            // context.commit('changeFullTasks', d)

            /* insure the logic of these code is same with @UPDATE_TASK */
            d.changed.forEach(task => {
                // handle counter first
                if (task['counter'] != undefined) {
                    context.commit('updateCounters', {taskId: task.task_id, counter: task.counter})
                    // delete counter field because it will be used below
                    delete task['counter']
                }
                if (context.state.vertexMap[task.vec_name] == undefined) {
                    context.commit('createVertex', task)
                } else {
                    // TODO: change as the update function
                    context.commit('updateVertex', task)
                }
            })
            context.commit('changeClusterNumber', context.state.vertexes.length)
            context.commit('updateLayout')
            /* insure end */

            finishedCheck()
            console.log('after finish check')
            dataService.queryFullMons({name: dataName}, d => {
                console.log('queryFullMons: %o', d)
                context.commit('updateMonData', d)
                finishedCheck()
            })

            dataService.queryFullOutliers({name: dataName}, d => {
                console.log('queryFullOutliers: %o', d)
                context.commit('updateOutlierData', d)
                finishedCheck()
            })

            dataService.queryFullFetches({name: dataName}, d => {
                console.log('queryFullFetches: %o', d)
                context.commit('updateFetch', d)
                context.commit('changeShowDataflow', true)
                context.commit('processDataFlow', context.state.application);
                console.log('results -----------', context.state.counters)
                console.log('results -----------', context.state.fetchData)
                finishedCheck()
            })
        })
    },

    queryUpdate({state, commit}) {
        const nextAckRealTime = new Date();
        const realDuration = parseInt(nextAckRealTime - state.ackRealTime);
        const nextAckTime = state.ackTime + realDuration;
        // console.log('query -> ', state.ackTime, nextAckTime);

        dataService.queryUpdate({
            aid: state.application.rawData.aid,
            start: state.ackTime,
            end: nextAckTime

        }, resp => {
            const newTasks = resp.new_tasks;
            const events = resp.events;
            const records = resp.records;
            console.log(resp)

            // loadTasksToApp(state, newTasks);
            // loadTaskEventsToApp(state, events);
            // setTimeout(() => commit('layoutAppTDAG'), 0)
        });
        commit('changeAckTime', nextAckTime);
        commit('changeAckRealTime', nextAckRealTime);
    },
    // Query the incr monitor data, then process the changed part
    queryMonUpdate(context) {
        dataService.queryMonUpdate({}, resp => {
            // console.log('mon update %o', resp)
            context.commit('updateMonData', resp.data);
            // stop last because this is an asyn func
            if (resp.sim_stop === true) {
                context.commit('changeMonRunning', false)
                if (context.state.simRunning === true) {
                    context.dispatch('stopSimulator')
                }
            }
        })
    },
    // Query the incr monitor data, then process the changed part
    queryFetchUpdate(context) {
        dataService.queryFetchUpdate({}, resp => {
            // console.log('fetch update %o', resp)
            context.commit('updateFetch', resp)
            context.commit("processDataFlow",context.state.application)
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
    changeAppMetaList(state, appMetaList) {
        state.appMetaList = appMetaList;
    },
    changeApplication(state, rawApp) {
        state.application = initApplication(rawApp);
    },
    loadVertexInformation(state, rawVertexes) {
        // state.application = loadVertexInformation(state.application, rawVertexes);
        state.dagRenderSign ^= 1;
        console.log(state.application);
    },

    /* simulation */

    startSimulation(state) {
        if (this.getters['simulation/running']) {
            console.error("is running...");
        }
        state.ackTime = 0;
        state.ackRealTime = new Date();
        state.timeIntervalId = setInterval(() => {
            this.dispatch("simulation/queryUpdate");
        }, state.updateRate);
    },
    stopSimulation(state) {
        if (!this.getters['simulation/running']) {
            console.error("is not running...");
        }
        clearInterval(state.timeIntervalId);
        state.timeIntervalId = null;
    },
    changeAckTime(state, ackTime) {
        state.ackTime = ackTime;
    },
    changeAckRealTime(state, ackRealTime) {
        state.ackRealTime = ackRealTime;
    },

    /* simulation end */

    changeAppShowingTaskOverviewMatrix(state){
        if (state.application.selectedMachineMetrics.length < 0)
            return
        state.perfCellClick = true
        state.application.overviewMatrix = !state.application.overviewMatrix
    },
    changeAppShowingTaskSelectedMachine(state, machineName){
        if (state.application.selectedMachineMetrics.length < 0)
            return
        let tmp = {}
        for (let machine in state.application.selectedMachineMetrics){
            tmp[machine] =  state.application.selectedMachineMetrics[machine]
        }
        tmp[machineName]=!tmp[machineName]
        state.application.selectedMachineMetrics = tmp
    },
    initialAppDiagnoseMatrix(state, diagnoseMatrix){
        state.application.diagnoseMatrix = diagnoseMatrix
    },
    layoutAppTDAG(state) {
        const app = state.application
        const maxDuration = app.vMaxTime - app.minTime;
        layoutTDAG(state, app, maxDuration)
        app.renderAxis ^= true
    },

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
    initIncrementalViewData(state) {
        state.taskNames = []
        state.vertexMap = {}
        state.vertexes = []
        state.renderEdges = []

        state.vtxLaneMap = {}

        state.monData = {}
        state.counters = {}
        state.fetchData = []
        state.fetchEndMap = {}
        state.outlierData = {}

        state.transmitData = {}

        state.maxCSize = 0
    },

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

            // this.commit('simulation/updateAllTask');
        }

        // /* layout */
        // let computeVtxLaneMap = function computeVtxLaneMap() {
        //     // get ready for the layout algo
        //     let graph = new Graph()
        //     Object.keys(state.vertexMap).forEach(vtxName => {
        //         let vertex = state.vertexMap[vtxName]
        //         let vld = new VertexLayoutData(xScale(vertex.startTime),
        //             xScale(vertex.endTime), 0, vtxName.charAt(0), [vtxName])
        //         graph.addNode(vtxName, vld)
        //     })
        //     Object.keys(state.childrenMap).forEach(vtxName => {
        //         let children = state.childrenMap[vtxName]
        //         children.forEach(child => graph.addEdge(child, vtxName))
        //     })
        //
        //     // run layout algo
        //     let greedyLayoutAlgo = new GreedyLayoutAlgo(state.dagRoot, graph, state.gapPixel)
        //     console.log(greedyLayoutAlgo)
        //     greedyLayoutAlgo.solve()
        //
        //     greedyLayoutAlgo.setResultToGraph()
        //
        //     return greedyLayoutAlgo.nodeLaneMap
        // }
        // state.vtxLaneMap = computeVtxLaneMap()
        // /* layout - end */

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

            // run layout algo first
            let greedyLayoutAlgo = new GreedyLayoutAlgo(state.dagRoot, graph, state.gapPixel, orderMap)
            console.log(greedyLayoutAlgo)
            greedyLayoutAlgo.solve()

            greedyLayoutAlgo.setResultToGraph(state.layoutConfig.vertexContainerHeight)

            // run aggregation
            const reLayoutFunc = g => {
                let root = g.nodes.find(n => n.data.vertexIdList.includes(state.dagRoot))
                let greedyLayoutAlgo = new GreedyLayoutAlgo(root.id, g, state.gapPixel, orderMap)
                // console.log(greedyLayoutAlgo)
                greedyLayoutAlgo.solve()
                greedyLayoutAlgo.setResultToGraph(state.layoutConfig.vertexContainerHeight)
            }
            // let mstAggrAlgo = new MSTAggrAlgo(graph, reLayoutFunc)
            // console.log(mstAggrAlgo)
            // mstAggrAlgo.solve(state.clusterNumber)
            // graph.edges.forEach(e => e.data = mstAggrAlgo.getWeight(e))

            // let mcAggrAlgo = new MCAggrAlgo(graph, reLayoutFunc, 1.05, 1.1)
            // console.log(mcAggrAlgo)
            // mcAggrAlgo.solve(state.mergeCount)
            // graph.edges.forEach(e => e.data = mcAggrAlgo.getWeight(e))

            // let depthAggrAlgo = new DepthAggrAlgo(graph)
            // console.log(depthAggrAlgo)
            // depthAggrAlgo.solve()
            // reLayoutFunc(graph)

            // let topologicalAggrAlgo = new TopologicalAggrAlgo(graph)
            // console.log(topologicalAggrAlgo)
            // topologicalAggrAlgo.solve()
            // reLayoutFunc(graph)
            //
            // return graph

            let tlAggrAlgo = new TLAggrAlgo(graph)
            console.log(tlAggrAlgo)
            tlAggrAlgo.solve()

            return tlAggrAlgo.hGraph

        }
        // state.mstAggrGraph = mstAggregate()
        state.hGraph = mstAggregate()
        this.commit('simulation/computeVisGraph')

        /* layout - end */
        state.vertexes.forEach(vertex => {
            // let _widtj=
            let layout = {};
            if (vertex.layout.x == 0) {
                vertex.layout.x = state.xScale(vertex.startTime);
                vertex.layout.mX = mXScale(vertex.startTime);
            } else {
                layout.x = state.xScale(vertex.startTime);
                layout.mX = mXScale(vertex.startTime);
            }
            layout.width = state.xScale(vertex.endTime) - state.xScale(vertex.startTime);
            let laneIdx = state.vtxLaneMap[vertex.vertexName]
            if (vertex.layout.y == 0) {
                vertex.layout.y = laneIdx * state.layoutConfig.vertexContainerHeight + state.layoutConfig.marginTop;
                vertex.layout.mY = mYScale(vertex.endTime);
            } else {
                layout.y = laneIdx * state.layoutConfig.vertexContainerHeight + state.layoutConfig.marginTop;
                layout.mY = mYScale(vertex.endTime);
            }
            let startX = 0;
            // let stepLayout = []
            let sumVal = d3.sum(vertex.steps);
            TweenLite.to(vertex.layout, state.updateRate / 1000, layout)
            vertex.steps.forEach((step, j) => {
                let stepWidth = sumVal == 0 ? 0 : (step / sumVal * layout.width);
                let stepLayoutObj = {
                    x: startX,
                    width: stepWidth,
                    id: j,
                    fill: state.layoutConfig.stepColors[j],
                    name: state.layoutConfig.stepName[vertex.hvType][j]
                }
                if (vertex.stepLayout.length < vertex.steps.length) {
                    vertex.stepLayout.push(stepLayoutObj)
                } else {
                    TweenLite.to(vertex.stepLayout[j], state.updateRate / 1000, stepLayoutObj);
                }
                // stepLayout.push(stepLayoutObj)
                startX += stepWidth;
            });
            // vertex.stepLayout = stepLayout;
            layout.height = state.layoutConfig.vertexHeight;
        })

        state.renderSign = !state.renderSign
    },
    createVertex(state, task) {
        this.commit('simulation/updateTask', task);
        let steps = [];
        task.time_len.forEach(d => steps.push(d));
        let vertex = {
            vertexName: task.vec_name,
            startTime: task.start_time,
            endTime: task.end_time,
            hvType: task.hv_type,
            steps: steps,
            taskMap: {},
            layout: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                mX: 0,
                mY: 0,
                selected: false,
                selectToExtend: true,
                childMerge: 0
            },
            stepLayout: [],
            dagNode: state.dagData.vertexMap[task.vec_name],

            ended: task.eov,
        }
        vertex.taskMap[task.task_id] = task;
        vertex.tasks = [task];
        state.vertexMap[vertex.vertexName] = vertex;
        state.vertexes.push(vertex);

        for (let i = 0, ilen = state.edges.length; i < ilen; i++) {
            let edge = state.edges[i];
            if (edge.srcVertexName == vertex.vertexName) {
                edge.srcRealNode = vertex;
                if (edge.dstRealNode != null) {
                    state.renderEdges.push({...edge, layout: {ctrl: state.xScale(vertex.endTime)}})
                }
            }
            if (edge.dstVertexName == vertex.vertexName) {
                edge.dstRealNode = vertex;
                if (edge.srcRealNode != null) {
                    state.renderEdges.push({...edge, layout: {ctrl: state.xScale(edge.srcRealNode.endTime)}})
                }
            }
        }
        // console.log('layout: %o, %o', state.edges, state.renderEdges)
        task.vertex = vertex;

        // update position according to the relationship
    },
    updateVertex(state, task) {
        //TODO: comments
        this.commit('simulation/updateTask', task);
        let currentVertex = state.vertexMap[task.vec_name];
        task.vertex = currentVertex;
        let task_id = task.task_id;
        if (currentVertex.taskMap[task_id] == undefined) {
            currentVertex.taskMap[task_id] = task;
            currentVertex.tasks.push(task);
            for (let i = 0, ilen = task.time_len.length; i < ilen; i++) {
                currentVertex.steps[i] += task.time_len[i];
            }
            task.fail = task.fail != undefined      // true if has this field
        } else {
            let preTask = currentVertex.taskMap[task_id];
            for (let i = 0, ilen = task.time_len.length; i < ilen; i++) {
                currentVertex.steps[i] = currentVertex.steps[i] + task.time_len[i] - preTask.time_len[i];
            }
            preTask.end_time = task.end_time;
            preTask.time_len = task.time_len;
            preTask.fail = task.fail != undefined      // true if has this field
        }
        if (task.fail) {
            console.log('task failed')
        }
        currentVertex.endTime = Math.max(task.end_time, currentVertex.endTime);
        if (task.eov) {
            currentVertex.ended = true
        }
    },
    updateTask(state, task) {
        if (state.maxTime == -1) {
            state.maxTime = task.end_time;
            state.minTime = task.start_time;
            state.absMinTime = task.start_time;
            state.absMaxTime = task.end_time;
            state.vMaxTime = task.end_time + state.incTimeStep;
            state.minTimeLength = task.end_time - task.start_time;
            state.maxTimeLength = task.end_time - task.start_time;
        } else {
            state.maxTime = d3.max([task.end_time, state.maxTime]);
            state.absMaxTime = state.maxTime;
            state.minTime = d3.min([task.start_time, state.minTime]);
            state.maxTimeLength = d3.max([task.end_time - task.start_time, state.maxTimeLength]);
            state.minTimeLength = d3.min([task.end_time - task.start_time, state.minTimeLength]);
            state.absMinTime = state.minTime;
            if (state.maxTime > state.vMaxTime) {
                state.vMaxTime = state.maxTime + state.incTimeStep;
            }
        }
        let task_id = task.task_id;
        let machineId = task.machine_id;
        if (state.machineMap[machineId] == undefined) {
            let machine = {
                'machineId': machineId,
                'taskList': [],
                'taskCount': "",
                'status': [],
            }
            state.machineMap[machineId] = machine
            state.machineList.push(machine)
        }

        let layout = {
            y: 0,
            x: 0,
            selected: false,
            selectedClick: false,

            selectAsProvider: false,
            selectCurrent: false,
            selectAsConsumer: false,
        };
        if (state.taskMap[task_id] == undefined) {
            task.selectedToExtend = false;
            task.layout = layout;
            state.taskList.push(task);
            state.selectTaskList.push(task);
            state.taskMap[task_id] = task;

            // add task to machine
            state.machineMap[machineId].taskList.push(task);

        } else {
            state.taskMap[task_id].end_time = task.end_time;
        }
    },
    updateAllTask(state) {
        state.taskList.forEach(task => {
            this.commit('simulation/updateTask', task);
        })
    },
    updateMonData(state, data) {
        let app = state.application
        for (let machineId in data) {
            let monList = data[machineId]
            if (app.monData[machineId] === undefined) {
                app.monData[machineId] = monList
            } else {
                let monData = app.monData[machineId]
                monList.forEach(item => monData.push(item))
            }
        }
        for (let machineId in state.application.monData) {
            if (app.machineMap[machineId]) {
                app.machineMap[machineId]['status'] = state.application.monData[machineId]
                // console.log('>>', state.machineMap[machineId]['status'].length)
            }
        }

        // update disk Max value
        let diskNames = Object.keys(app.metrics.diskMax);
        let metrics = app.metrics.diskMetric;
        if (Object.values(data).length > 0) {
            metrics.forEach(metric => {
                diskNames.forEach(diskName => {
                    app.metrics.diskMax[diskName][metric] = d3.max(Object.values(data),
                        machineValue => d3.max(machineValue, d => d.iostat[diskName] == undefined ? 0 : d.iostat[diskName][metric]))
                })
            })
        }
        // update netIO maxValue

        let netMetrics = app.metrics.netIO;
        if (Object.values(data).length > 0) {
            netMetrics.forEach(metric => {
                app.metrics.netIOMax[metric] = d3.max(Object.values(data),
                    machineValue => d3.max(machineValue, d => d.netIO[metric]))
            })
        }
        state.application.changeRenderSign();
        state.renderSign = !state.renderSign
    },
    updateOutlierData(state, data) {
        state.outlierData = data
    },
    updateFetch(state, {changes, maxCSize,fetchGlyphs}) {
        changes.forEach(d=>{
            state.application.fetchData.push(d)
        })
        state.application.maxCSize = maxCSize
        fetchGlyphs.forEach(d=>{
            state.application.abnormalDeps.push(d)
        })
        // state.application.fetchData = changes
        state.fetchData = changes
        // changes.forEach(d => {
        //     // if (d.src === undefined){
        //     //     alert(1)
        //     // }
        //     if (d.key === "undefined") {
        //         alert("2")
        //     }
        // })
        // changes.forEach(fetchInfo => {
        //     state.fetchData.push(fetchInfo)
        // })
        // for (let taskId in ends) {
        //     let fetchEnds = state.fetchEndMap[taskId];
        //     if (fetchEnds == undefined) {
        //         fetchEnds = []
        //         state.fetchEndMap[taskId] = fetchEnds
        //     }
        //     let endVertexes = ends[taskId]
        //     endVertexes.forEach(vertexName => {
        //         fetchEnds.push(vertexName)
        //     })
        // }
    },
    fixTaskStepInfo(state, taskList) {
        taskList.forEach(task => {
            state.application.taskMap[task.task_id].step_info = task.step_info
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
        state.application.machineList.forEach((machine, i) => machineIdxMap[machine.machineId] = i)
        let machineCnt = Object.keys(machineIdxMap).length
        if (machineCnt === 0) {
            return
        }
        state.application.fetchData.forEach(fetchInfo => {
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
                state.application.maxCSize = Math.max(state.application.maxCSize, fetchInfo.csize)

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
                        state.application.maxCSize = Math.max(state.application.maxCSize, size)
                    })
                    transmitted.add(srcVtxName)
                }
            }
        })
        state.transmitData = transmitMap

        console.log('fetchData: %o', state.application.fetchData)
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

    processDataFlow(state, app) {
        function addSrcDstTask(srcTask, dstTask, app){
            if (srcTask === undefined || dstTask === undefined)
            {return}
            let srcTaskMap = app.depTaskMaps.srcTaskMap, dstTaskMap = app.depTaskMaps.dstTaskMap
            if(!srcTaskMap[dstTask.task_id]){
                srcTaskMap[dstTask.task_id] = {}
            }
            if(!srcTaskMap[dstTask.task_id][srcTask.task_id]){
                srcTaskMap[dstTask.task_id][srcTask.task_id] = srcTask
            }
            if(!dstTaskMap[srcTask.task_id]){
                dstTaskMap[srcTask.task_id] = {}
            }
            if(!dstTaskMap[srcTask.task_id][dstTask.task_id]){
                dstTaskMap[srcTask.task_id][dstTask.task_id] = dstTask
            }
        }

        function addSrcDstDep(srcTask, dstTask, dep, app){
            if (srcTask === undefined || dstTask === undefined)
            {return}
            let srcDepMap = app.depTaskMaps.srcDepMap, dstDepMap = app.depTaskMaps.dstDepMap
            // -------------- src
            if(!srcDepMap[dstTask.task_id]){
                srcDepMap[dstTask.task_id] = {}
            }
            if(!srcDepMap[dstTask.task_id][dep.dep_id]){
                srcDepMap[dstTask.task_id][dep.dep_id] = dep
            }
            // -------------- dst
            if(!dstDepMap[srcTask.task_id]){
                dstDepMap[srcTask.task_id] = {}
            }
            if(!dstDepMap[srcTask.task_id][dep.dep_id]){
                dstDepMap[srcTask.task_id][dep.dep_id] = dep
            }
        }
        app.fetchData.forEach(dict => {
            if (app.taskMap[dict.src] !== undefined && app.taskMap[dict.dst] !== undefined){
            if (dict.label === 'NORMAL') {
                dict.srcTask = app.taskMap[dict.src];
                dict.dstTask = app.taskMap[dict.dst];
                //  add depMap
                addSrcDstTask(dict.srcTask, dict.dstTask, app)
            } else {
                // src are all tasks from srcVtxName
                dict.srcTasks = app.vertexMap[dict.srcVtxName].tasks
                dict.dstTask = app.taskMap[dict.dst];
                dict.srcTasks.forEach(srcTask=>{
                    addSrcDstTask(srcTask, dict.dstTask, app)
                })
            }
        }})
        app.dataFlow = app.fetchData

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


        app.abnormalDeps.forEach((fetchGlyph) =>{
            if (app.taskMap[fetchGlyph.srcTask] !== undefined && app.taskMap[fetchGlyph.dstTask] !== undefined){

                fetchGlyph.srcTask = app.taskMap[fetchGlyph.srcTask]
            fetchGlyph.dstTask = app.taskMap[fetchGlyph.dstTask]
            addSrcDstDep(fetchGlyph.srcTask, fetchGlyph.dstTask, fetchGlyph, app)
        }})

        // const fetchGlyphs = []
        // const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        //     .domain([0, maxCSize]);
        // app.dataFlow.forEach((d) => {
        //   if (d.label === 'NORMAL') {
        //     const xTime = d.dstTask.start_time
        //     const yTime = d.srcTask.end_time
        //     if (xTime >= yTime) {
        //       return
        //     }
        //     const fetchGlyph = {
        //       // fill: colorScale(d.csize),
        //       // fetch: d,
        //       srcTask: d.srcTask,
        //       dstTask: d.dstTask,
        //       dep_id: d.srcTask.task_id + '_' + d.dstTask.task_id,
        //       // highlight: false,
        //     }
        //     fetchGlyphs.push(fetchGlyph)
        //     addSrcDstDep(d.srcTask, d.dstTask, fetchGlyph, app)
        //   }
        //   else {
        //     d.srcTasks.forEach(srcTask => {
        //       const xTime = d.dstTask.start_time
        //       const yTime = srcTask.end_time
        //       if (xTime >= yTime) {
        //         return
        //       }
        //       let srcTaskCounters = app.counters[srcTask['task_id']]
        //       const fetchGlyph = {
        //         // fill: colorScale(srcTaskCounters['OUTPUT_BYTES']),
        //         // fetch: d,
        //         srcTask: srcTask,
        //         dstTask: d.dstTask,
        //         dep_id: srcTask.task_id + '_' + d.dstTask.task_id,
        //         // highlight: false,
        //       }
        //       fetchGlyphs.push(fetchGlyph)
        //       addSrcDstDep(srcTask, d.dstTask, fetchGlyph, app)
        //     })
        //   }
        // })
        // app.abnormalDeps = fetchGlyphs

    },

    changeInLoading(state, inLoading) {
        state.inLoading = inLoading
    },
    trgFinishLoading(state) {
        state.finishLoading = true
    },

    changeSimulationStatus(state, status) {
        //TODO use when task length
        const nestData = d3.nest().key(d=>d.vec_name).key(d=>d.machine_id).entries(state.application.taskList)
        nestData.forEach((vertex)=>{
            vertex.config = {
                outerSelect: false,
                height: this.unitHeight, totalHeight:this.unitHeight, detailHeight: this.detailHeight, unitHeight: this.unitHeight}
            vertex.type= 'vertex'
            vertex.vertex = vertex.key
            vertex.extend = false
            vertex.detail = false
            vertex.values.forEach(machine => {
                machine.type = 'machine'
                machine.vertex = vertex.key
                machine.machine = machine.key
                machine.extend = false
                machine.detail = false
                machine.config = {
                    outerSelect: false,
                    height: this.unitHeight, totalHeight: this.unitHeight, detailHeight: this.detailHeight, unitHeight: this.unitHeight}
                machine.taskList = []
                machine.values.forEach(task=>{
                    task.type = 'task'
                    task.vertex = vertex.key
                    task.machine = machine.key
                    task.task = task.task_id
                    task.config = {outerSelect: false, height: this.unitHeight, totalHeight: this.unitHeight, detailHeight: this.detailHeight, unitHeight: this.unitHeight}
                    let taskTemplate = JSON.parse(JSON.stringify(task))
                    taskTemplate.origin = task
                    taskTemplate.machine = machine
                    taskTemplate.vertex = vertex
                    task.listCopy = taskTemplate
                    machine.taskList.push(taskTemplate)
                })
            })
        })
        state.finishSimulation = status
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
    changeShowDataflow(state, showDataflow) {
        state.showDataflow = showDataflow
    },
    changeShowCompound(state, showCompound) {
        state.showCompound = showCompound
    },
    changeClusterNumber(state, clusterNumber) {
        state.clusterNumber = clusterNumber
    },
    changeMergeCount(state, mergeCount) {
        state.mergeCount = mergeCount
    },

    updateTaskScale(state, region) {
        mXScale.range([matrixLayoutCOnfig.marginLeft, region.width - matrixLayoutCOnfig.marginRight]);
        mYScale.range([matrixLayoutCOnfig.marginTop, region.height - matrixLayoutCOnfig.marginBottom]);
        matrixLayoutCOnfig.upperHeight = region.upperHeight;
    },

    updateIncrementalScale(state, region) {
        layoutConfig.width = region.width;
        layoutConfig.height = region.height - 20;
        state.xScale.range([layoutConfig.marginLeft, layoutConfig.width - layoutConfig.marginRight]);
    },
    estimationIncrementalContainerHeight(state, nVertex) {
        layoutConfig.vertexContainerHeight = Math.max((layoutConfig.height - 50) / nVertex, 45);
        layoutConfig.vertexContainerHeight = Math.min(20, layoutConfig.vertexContainerHeight);

        layoutConfig.vertexHeight = (layoutConfig.vertexContainerHeight - 8) * 0.8
    },
    // getTaskCountByTaskList(state, tasks) {
    //     let usage = [];
    //     let trend = [];
    //     let count = 0;
    //     tasks.forEach(task => {
    //         usage.push({'type': 'start', 'time': task.start_time});
    //         usage.push({'type': 'end', 'time': task.end_time});
    //     })
    //     usage.sort((a, b) => (a.time > b.time) ? 1 : -1);
    //
    //     usage.forEach(u => {
    //         if (u.type == 'start') {
    //             count += 1;
    //         } else if (u.type == 'end') {
    //             count -= 1;
    //         } else {
    //             console.log('error type')
    //         }
    //         if (trend.length > 0 && trend[trend.length - 1].time == u.time) {
    //             trend[trend.length - 1].count = count;
    //         } else {
    //             trend.push({'time': u.time, 'count': count})
    //         }
    //     })
    //
    //     let _render = [];
    //     trend.forEach((u, i) => {
    //         if (i != 0) {
    //             _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
    //         }
    //         _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
    //     })
    //     state.selectTaskCount = dLine(_render);
    // },
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
    // selectVertex(state, vertex) {
    //
    //     if (vertex == state.selectedVertex) {
    //         state.selectedVertex = null;
    //     } else {
    //         state.selectedVertex = vertex;
    //     }
    //
    // },
    // changeTDAGCursorMode(state, mode) {
    //     state.tdagCursorMode = mode
    // },
    // computeVisGraph(state) {
    //     state.visGraph = new VisHierarchyGraph(state.hGraph, {
    //         dagRoot: state.dagRoot,
    //         gapPixel: state.gapPixel,
    //         orderMap: (() => {
    //             let orderMap = new Map()
    //             Object.keys(state.orderMap).forEach(vertexName => {
    //                 orderMap.set(vertexName, state.orderMap[vertexName])
    //             })
    //             return orderMap
    //         })(),
    //         vertexContainerHeight: state.LayoutConfig.vertexContainerHeight
    //     })
    //     state.visGraph.computeStepLayout(state.vertexMap, xScale, state.LayoutConfig)
    // },
    // handleTDAGNodeClick(state, node) {
    //     const aggrNode = node.data.hGraphNode.data
    //     console.log(node, aggrNode)
    //     switch (state.tdagCursorMode) {
    //         case TDAGCursorMode.NORMAL:
    //             break;
    //         case TDAGCursorMode.UNFOLD:
    //             state.hGraph.expandNode(aggrNode)
    //             this.commit('simulation/computeVisGraph')
    //             // state.updateTDADGSign ^= true
    //             break;
    //         case TDAGCursorMode.FOLD:
    //             if (aggrNode.parent) {
    //                 state.hGraph.aggregateNodeByParent(aggrNode.parent)
    //                 this.commit('simulation/computeVisGraph')
    //                 // state.updateTDADGSign ^= true
    //             } else {
    //                 console.warn('can not aggregate root')
    //             }
    //             break;
    //     }
    // },
    changeHighlightByTask(state, {vertices, type, value}) {
        vertices.forEach(vertexName => {
            const node = state.application.visGraph.vertexName2Node.get(vertexName)
            node.data.layout[type] = value
        })
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
