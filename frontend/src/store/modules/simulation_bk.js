// import * as d3 from "d3";
// import TweenLite from "gsap";
// import dataService from "@/service/dataService";
// import {LayoutAlgo} from "@/utils/algo/layoutAlgo"
// import {AggrAlgo, AggrEdge, AggrNode} from "@/utils/algo/AggrAlgo";
// import {CompoundGraph} from "@/utils/entities/CompoundGraph";
// import {DagreLayoutAlgo} from "@/utils/algo/dagre-tdag-layout/DagreLayoutAlgo";

// /*
// Contain:
// search based algo
// compound graph algo
// dagre layout algo
// */


// const metrics = {
//     netIO: ['bytesRecv', 'bytesSent', 'dropin', 'dropout', 'errin', 'errout', 'packetsRecv', 'packetsSent'],
//     diskMetric: ['avgquSz', 'avgrqSz', 'await', 'rAwait', 'rkBs', 'rrqms', 'rs', 'wAwait', 'wkBs', 'wrqms', 'ws'],
//     diskMax: {'dm-0': {}, loop: {}, sdb: {}},
//     netIOMax: {}

// }

// metrics.diskMetric.forEach(metric => {
//     metrics.diskMax['dm-0'][metric] = 0;
//     metrics.diskMax.loop[metric] = 0;
//     metrics.diskMax.sdb[metric] = 0;
// })
// metrics.netIO.forEach(metric => {
//     metrics.netIOMax[metric] = 0;
// })


// // put them to where ?
// const LayoutConfig = {
//     marginTop: 20,
//     marginLeft: 20,
//     marginRight: 20,
//     vertexContainerHeight: 15,
//     vertexHeight: 20,
//     width: 1000,
//     height: 800,
//     stepColors:["#1F77B4", "#FFA556",
//         "#2CA02C", "#9467BD", "#EE6545"],
//     // stepColors2: ["#1776B6", "#FF7F00",
//     //     "#24A221", "#d8241f", "#BCBF00"],
//     outlierColors: ["#d92b2b", "#3469f8", "#e8e8e8"],
//     stepName: {
//         'Map': ["Initialization", "Input", "Processor", "Sink", "Spill"],
//         'Reducer': ["Initialization", "Shuffle", "Processor", "Sink", "Spill"],
//     }
// }
// const xScale = d3.scaleLinear().range([LayoutConfig.marginLeft, LayoutConfig.width - LayoutConfig.marginRight]);

// const dLine = d3.line().x(d => d.x).y(d => d.y);
// const matrixLayoutCOnfig = {
//     marginTop: 0,
//     marginLeft: 0,
//     marginRight: 0,
//     marginBottom: 0,
//     height: 300,
//     width: 100,
//     matrixMin: {},
//     matrixMax: {},
//     upperHeight: 1000,
// }

// const mXScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginLeft, matrixLayoutCOnfig.width - matrixLayoutCOnfig.marginRight]);
// const mYScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginTop, matrixLayoutCOnfig.height - matrixLayoutCOnfig.marginBottom]);
// const mTYScale = d3.scaleLinear().range([matrixLayoutCOnfig.marginTop, matrixLayoutCOnfig.height - matrixLayoutCOnfig.marginBottom]);

// const sortGraphNodes = function (nodes, edges) {
//     let idNode = {};
//     nodes.forEach(node => {
//         idNode[node.idx] = node
//         node.children = [];
//         node.parent = [];
//         node.vertex_name = node.vdat.vertex_name;
//     })
//     edges.forEach(edge => {
//         let parentNode = idNode[edge.dst], childNode = idNode[edge.src];
//         parentNode.children.push(childNode), childNode.parent.push(parentNode);
//     })

//     let orderedNodes = [];
//     let visitMap = {}
//     let procNode = function (node) {
//         if (visitMap[node.idx] != undefined) {
//             return
//         }
//         node.children.forEach(child => {
//             procNode(child)
//         })
//         orderedNodes.push(node);
//         visitMap[node.idx] = node
//     }
//     let root = nodes[0]
//     while (root.parent.length !== 0) {
//         root = root.parent[0]
//     }
//     procNode(root)
//     return orderedNodes
// }

// const getOrSetIfMiss = function (map, key, default_) {
//     let res = map[key]
//     if (res == undefined) {
//         res = default_
//         map[key] = default_
//     }
//     return res
// }


// // initial state
// const state = () => ({
//     dagData: null,
//     sqlData: null,
//     fullTasks: null,
//     dataNames: [],
//     taskNames: [],      // used in incr

//     simDataName: null,
//     showDataflow: false,

//     monData: {},        // monitor data for each machine
//     counters: {},       // counter map for each task

//     fetchData: [],      // fetch info from task to task.
//     fetchEndMap: {},    // the finished input of task from a vertex. taskId -> list of vertexName

//     outlierData: {},    // task id -> {v, vm}

//     transmitData: {},       // srcVtxName -> dstVtxName -> {machines, n X n matrix}

//     simRunning: false,
//     monRunning: false,

//     vertexMap: {},      // used in incr
//     vertexes: [],       // used in incr
//     selectedVertex: null,
//     LayoutConfig: LayoutConfig,
//     gapPixel: 25,       // the horizontal gasp between two vertex at same lane in data flow diagram

//     // use to layout the vertexes
//     orderMap: {},               // const
//     orderedVertexIdx: [],       // const
//     dagRoot: '',                // const
//     childrenMap: {},           // const, parent vtxName -> list of children
//     parentsMap: {},            // const, child vtxName -> list of parents
//     vtxLaneMap: {},

//     inLoading: false,        // is data flow diagram in loading (by press button)

//     metrics: metrics,

//     taskList: [],
//     taskMap: {},
//     taskCount: "",


//     selectTaskList: [],


//     machineList: [],
//     machineMap: {},

//     incTimeStep: 60 * 10,

//     //Once this is changed, call all the render functions
//     renderSign: true,

//     selectTaskCount: "",
//     timeSelection: {
//         x1: 0,
//         y1: 0,
//         x2: 0,
//         y2: 0,
//         startTime: -1,
//         endTime: -1,
//         minStartTime: -1,
//         maxStartTime: -1,
//         minEndTime: -1,
//         maxEndTime: -1
//     },

//     matrixDiagMin: {x: 0, y: 0},
//     matrixDiagMax: {x: 0, y: 0},

//     timeHandler: null,      // move the interval id to vuex
//     updateRate: 200, // ms
//     startTime: -1,
//     endTime: -1,

//     edges: [],
//     renderEdges: [],

//     // below var are data of simulator in backend
//     simRate: null,     // will update when page mounted

//     absMaxTime: -1,
//     abxMinTime: -1,
//     minTime: -1,
//     maxTime: -1,
//     vMaxTime: -1,
//     minTimeLength: Number.MAX_VALUE,
//     maxTimeLength:-1,

//     minDataSize: Number.MAX_VALUE,
//     maxDataSize: -1,

//     dataFlow:[],
//     maxCSize: 0,        // max transfer size (only for fetch now)

//     colorSchema: {
//         'Map': "#1b9e77",
//         'Reducer': "#D95F02",
//         'selected': "purple",
//         'MapFail': '#1b9e77',
//         'ReducerFail': '#D95F02',
//         'selectedFail': '#bb0000'
//     },

//     // interaction start >>>>>>
//     taskViewSelects: [],
//     // interaction end <<<<<<<<

//     // linkColorPool: d3.schemeCategory10,

//     compoundGraph: null,
//     showCompound: false,
// })

// // getters
// const getters = {
//     // represent whether the simulator is running or not
//     running: state => state.timeHandler != null,
// }

// // actions
// const actions = {
//     // Start the simulator, if not running yet
//     startSimulator(context, dataName) {
//         if (context.getters.running) {
//             // running. must stop first
//             return
//         }
//         context.commit('initIncrementalViewData')   // clean incremental view data first
//         dataService.startSimulator({dataName: dataName}, d => {
//             console.log('start simulator. %o', d)
//             context.commit('changeSimDataName', dataName)
//             context.commit('changeShowDataflow', false)
//             let doUpdate = function () {
//                 if (context.state.simRunning) {
//                     context.dispatch('queryUpdate')
//                     context.dispatch('queryFetchUpdate')
//                 }
//                 if (context.state.monRunning) {
//                     context.dispatch('queryMonUpdate')
//                 }
//             }
//             let timeHandler = setInterval(doUpdate, context.state.updateRate);
//             console.log('Set interval', timeHandler);
//             context.commit('changeSimRunning', true)
//             context.commit('changeMonRunning', true)
//             context.commit('changeTimeHandler', {timeHandler})
//         })
//     },

//     // Stop the simulator, if is running
//     stopSimulator(context) {
//         console.log('running: ', context.getters.running)
//         if (!context.getters.running) {
//             // is not running, do nothing
//             return
//         }
//         // stop backend
//         dataService.stopSimulator({}, resp => {
//             console.log('stop simulator. %o', resp);
//             console.log('simulation vertex', context.state);
//             console.log('stopped machine', context.state.machineMap);
//             context.commit('changeShowDataflow', true)
//             context.commit('processDataFlow');
//             context.commit('computeTransmission')
//             context.commit('computeTaskRecvSend')

//             dataService.queryFullTasks({name: context.state.simDataName}, d => {
//                 context.commit('fixTaskStepInfo', d.changed)
//             })

//             dataService.queryFullOutliers({name: context.state.simDataName}, d => {
//                 console.log('queryFullOutliers: %o', d)
//                 context.commit('updateOutlierData', d)
//             })
//             console.log('results -----------111 ', context.state.counters)
//             console.log('results -----------111 ', context.state.fetchData)
//         })
//         // stop frontend
//         clearInterval(context.state.timeHandler)
//         console.log('Clear interval', context.state.timeHandler);
//         context.commit('changeSimRunning', false)       // for stop button click
//         context.commit('changeMonRunning', false)
//         context.commit('changeTimeHandler', {timeHandler: null})
//     },

//     // Query the static dag data, using dataName
//     queryDag(context, dataName) {
//         dataService.queryDag({name: dataName}, d => {
//             context.commit('initIncrementalViewData')
//             context.commit('changeDagNodes', d)
//             context.commit('changeDagEdges', d)
//         })
//     },

//     // Query the static data, using dataName
//     queryDirectlyLoad(context, dataName) {
//         context.commit('changeInLoading', true)
//         let finishedCnt = 1
//         let finishedCheck = function () {
//             finishedCnt -= 1
//             if (finishedCnt <= 0) {
//                 context.commit('changeInLoading', false)
//                 // context.commit('computeTransmission')
//                 // context.commit('computeTaskRecvSend')
//             }
//         }

//         dataService.queryFullTasks({name: dataName}, d => {
//             console.log('queryFullTasks: %o', d)
//             // context.commit('changeFullTasks', d)

//             /* insure the logic of these code is same with @UPDATE_TASK */
//             d.changed.forEach(task => {
//                 // handle counter first
//                 if (task['counter'] != undefined) {
//                     context.commit('updateCounters', {taskId: task.task_id, counter: task.counter})
//                     // delete counter field because it will be used below
//                     delete task['counter']
//                 }
//                 if (context.state.vertexMap[task.vec_name] == undefined) {
//                     context.commit('createVertex', task)
//                 } else {
//                     // TODO: change as the update function
//                     context.commit('updateVertex', task)
//                 }
//             })
//             context.commit('updateLayout')
//             /* insure end */

//             finishedCheck()

//             // dataService.queryFullMons({name: dataName}, d => {
//             //     console.log('queryFullMons: %o', d)
//             //     context.commit('updateMonData', d)
//             //     finishedCheck()
//             // })
//             //
//             // dataService.queryFullOutliers({name: dataName}, d => {
//             //     console.log('queryFullOutliers: %o', d)
//             //     context.commit('updateOutlierData', d)
//             //     finishedCheck()
//             // })
//             //
//             // dataService.queryFullFetches({name: dataName}, d => {
//             //     console.log('queryFullFetches: %o', d)
//             //     context.commit('updateFetch', d)
//             //     context.commit('changeShowDataflow', true)
//             //     context.commit('processDataFlow');
//             //     console.log('results -----------', context.state.counters)
//             //     console.log('results -----------', context.state.fetchData)
//             //     finishedCheck()
//             // })
//         })
//     },

//     // Query the sql, using dataName
//     querySql(context, dataName) {
//         dataService.querySql({name: dataName}, d => {
//             console.log('sql', d)
//             context.commit('changeSqlData', d)
//         })
//     },
//     // Query the incr data, then process the changed part
//     queryUpdate(context) {
//         dataService.queryUpdate({}, resp => {
//             let sign = false;

//             /* insure the logic of these code is same with @UPDATE_TASK */
//             resp.changed.forEach(task => {

//                 // handle counter first
//                 if (task['counter'] != undefined) {
//                     context.commit('updateCounters', {taskId: task.task_id, counter: task.counter})
//                     // delete counter field because it will be used below
//                     delete task['counter']
//                 }
//                 if (context.state.vertexMap[task.vec_name] == undefined) {
//                     context.commit('createVertex', task)
//                 } else {
//                     // TODO: change as the update function
//                     context.commit('updateVertex', task)
//                 }
//                 if (task.task_id == "attempt_1611231118798_1337_1_07_000000_0") {
//                     console.log('get task attempt_1611231118798_1337_1_07_000000_0', task);
//                     console.log(task.time_len);
//                     sign = true
//                 }
//             })
//             context.commit('updateLayout')
//             /* insure end */

//             if (sign == true) {
//                 console.log('cee', context.state.vertexes)
//             }
//             // stop last because this is an asyn func
//             if (resp.sim_stop == true) {
//                 context.commit('changeSimRunning', false)
//                 if (context.state.monRunning == true) {
//                     context.dispatch('stopSimulator')
//                 }
//             }
//         })
//     },
//     // Query the incr monitor data, then process the changed part
//     queryMonUpdate(context) {
//         dataService.queryMonUpdate({}, resp => {
//             // console.log('mon update %o', resp)
//             context.commit('updateMonData', resp.data);
//             // stop last because this is an asyn func
//             if (resp.sim_stop == true) {
//                 context.commit('changeMonRunning', false)
//                 if (context.state.simRunning == true) {
//                     context.dispatch('stopSimulator')
//                 }
//             }
//         })
//     },
//     // Query the incr monitor data, then process the changed part
//     queryFetchUpdate(context) {
//         dataService.queryFetchUpdate({}, resp => {
//             // console.log('fetch update %o', resp)
//             context.commit('updateFetch', resp)
//             // no need to care about stop flag here
//         })
//     },
//     // Query the list of data names
//     queryAllDataNames(context) {
//         dataService.getDatasetNames({}, d => {
//             context.commit('changeDataNames', d)
//         })
//     },
//     // Query the simulation rate
//     querySimRate(context) {
//         dataService.getSimRate({}, d => {
//             console.log('get sim rate. %o', d)
//             context.commit('changeSimRate', d)
//         })
//     },
//     // Set the simulation rate
//     updateSimRate(context, simRate) {
//         dataService.updateSimRate({simRate}, d => {
//             console.log('update sim rate. %o', d)
//             // context.commit('changeSimRate', d)
//         })
//     },
//     // The below functions are not used yet
//     queryDataByName(context, dataName) {
//         dataService.getConfiguration({name: dataName}, d => {
//             console.log('getConfiguration ? ', d)
//             // ??
//         })
//     },
// }

// // mutations
// const mutations = {
//     updateSelectTimeScale(state, range) {
//         if (range == undefined || range.length != 2) {
//             state.minTime = state.absMinTime;
//             state.maxTime = state.absMaxTime;
//             console.log('mutation', state.maxTime, state.minTime);
//         } else {
//             state.minTime = range[0];
//             state.maxTime = range[1];
//         }

//         state.renderSign = !state.renderSign
//     },
//     updateTaskView(state, tasks){
//         if(tasks == undefined){
//             state.selectTaskList = state.taskList;
//         }else{
//             state.selectTaskList = tasks;
//         }
//     },
//     initIncrementalViewData(state) {
//         state.taskNames = []
//         state.vertexMap = {}
//         state.vertexes = []
//         state.renderEdges = []

//         state.vtxLaneMap = {}

//         state.monData = {}
//         state.counters = {}
//         state.fetchData = []
//         state.fetchEndMap = {}
//         state.outlierData = {}

//         state.transmitData = {}

//         state.maxCSize = 0
//     },

//     updateLayout(state) {
//         // Layout all nodes
//         // let startTime = state.vertexes[0].startTime;
//         // let endTime = state.vertexes[state.vertexes.length - 1].endTime;
//         let startTime = d3.min(state.vertexes, vertex => vertex.startTime);
//         let endTime = d3.max(state.vertexes, vertex => vertex.endTime);
//         state.startTime = startTime
//         if (endTime > state.endTime) {
//             state.endTime = (endTime - startTime) * 1.2 + startTime;
//             xScale.domain([startTime, state.endTime]);
//             mXScale.domain([startTime, state.endTime]);
//             mYScale.domain([startTime, state.endTime]);

//             state.matrixDiagMin.x = mXScale(startTime);
//             state.matrixDiagMin.y = mYScale(startTime);
//             state.matrixDiagMax.x = mXScale(state.endTime);
//             state.matrixDiagMax.y = mYScale(state.endTime);

//             // this.commit('simulation/updateAllTask');
//         }

//         /* greedy layout - part 1 */
//         let computeVtxLaneMap = function computeVtxLaneMap() {
//             let nodeMap = {}
//             Object.keys(state.vertexMap).forEach(vtxName => {
//                 let vertex = state.vertexMap[vtxName]
//                 nodeMap[vtxName] = {
//                     id: vtxName, x0: xScale(vertex.startTime),
//                     x1: xScale(vertex.endTime)
//                 }
//             })
//             let layoutAlgo = new LayoutAlgo(state.dagRoot, nodeMap,
//               state.orderMap, state.childrenMap, state.gapPixel)
//             console.log(layoutAlgo)
//             layoutAlgo.solve()

//             return layoutAlgo.nodeLaneMap
//         }
//         state.vtxLaneMap = computeVtxLaneMap()

//         let aggregateVertexes = function aggregateVertexes() {
//             let aggrNodeMap = new Map()
//             state.vertexes.forEach(vtx => {
//                 let y = LayoutConfig.vertexContainerHeight * state.vtxLaneMap[vtx.vertexName]
//                 let aNode = new AggrNode(vtx.vertexName, vtx.vertexName[0],
//                   xScale(vtx.startTime), xScale(vtx.endTime), y)
//                 aggrNodeMap.set(aNode.id, aNode)
//             })
//             Array.from(aggrNodeMap.values()).forEach(aNode => {
//                 let children = state.childrenMap[aNode.id]
//                 children.forEach(child => {
//                     let childAggrNode = aggrNodeMap.get(child)
//                     let aggrEdge = new AggrEdge(childAggrNode, aNode)
//                     childAggrNode.outEdges.push(aggrEdge)
//                     aNode.inEdges.push(aggrEdge)
//                 })
//             })
//             let aggrAlgo = new AggrAlgo(aggrNodeMap, state.dagRoot)
//             console.log(aggrAlgo)
//             aggrAlgo.execute()
//             console.log('aggr result', aggrAlgo.clusters)
//             return aggrAlgo.getResult()
//         }
//         let {allocMap, clusters} = aggregateVertexes()

//         let computeCompoundGraph = function computeCompoundGraph() {
//             let nodeMap = {}, orderMap = {}, childrenMap = {}
//             Array.from(clusters.keys()).forEach((centroid, ci) => {
//                 let clusterVertexes = clusters.get(centroid)
//                 let startTime = d3.min(clusterVertexes,
//                     vtxName => state.vertexMap[vtxName].startTime)
//                 let endTime = d3.max(clusterVertexes,
//                     vtxName => state.vertexMap[vtxName].endTime)
//                 let virtualNode = {
//                     id: centroid,
//                     x0: xScale(startTime), x1: xScale(endTime),
//                     nodes: clusterVertexes
//                 }
//                 nodeMap[centroid] = virtualNode
//                 orderMap[virtualNode.id] = ci
//                 childrenMap[virtualNode.id] = []
//             })
//             Object.keys(nodeMap).forEach(vNodeId => {
//                 let vNode = nodeMap[vNodeId]
//                 vNode.nodes.forEach(vtxName => {
//                     state.childrenMap[vtxName].forEach(childName => {
//                         let childVNodeId = allocMap.get(childName)
//                         if (childVNodeId !== vNode.id) {
//                             childrenMap[vNode.id].push(childVNodeId)
//                         }
//                     })
//                 })
//                 childrenMap[vNode.id] = Array.from(new Set(childrenMap[vNode.id]))
//             })


//             // let rootCid = allocMap.get(state.dagRoot)
//             // let layoutAlgo = new LayoutAlgo(rootCid, nodeMap,
//             //   orderMap, childrenMap, state.gapPixel)
//             // console.log('group layout', layoutAlgo)
//             // layoutAlgo.solve()
//             //
//             // let cGraph = new CompoundGraph()
//             // Object.keys(nodeMap).forEach(vNodeId => {
//             //     let vNode = nodeMap[vNodeId]
//             //     let cNode = cGraph.addNode('@ ' + vNode.id, vNode.nodes)
//             //     let laneIdx = layoutAlgo.nodeLaneMap[vNode.id]
//             //     cNode.setLayout({
//             //         x: vNode.x0,
//             //         y: laneIdx * state.LayoutConfig.vertexContainerHeight
//             //           + state.LayoutConfig.marginTop,
//             //         height: state.LayoutConfig.vertexHeight,
//             //         width: vNode.x1 - vNode.x0,
//             //     })
//             // })
//             //
//             // Object.keys(childrenMap).forEach(vNodeId => {
//             //     let children = childrenMap[vNodeId]
//             //     children.forEach(child => {
//             //         cGraph.addEdge('@ ' + child, '@ ' + vNodeId)
//             //     })
//             // })

//             /* dagre layout */
//             let dagreLayoutAlgo = new DagreLayoutAlgo(state.gapPixel, state.LayoutConfig)
//             Object.keys(nodeMap).forEach(id => {
//                 let node = nodeMap[id]
//                 dagreLayoutAlgo.setNode(node.id, node.x0, node.x1)
//             })
//             Object.keys(childrenMap).forEach(id => {
//                 let children = childrenMap[id]
//                 children.forEach(child => dagreLayoutAlgo.setEdge(child, id))
//             })
//             console.log('group layout(dagre)', dagreLayoutAlgo)
//             dagreLayoutAlgo.solve()

//             /* dagre layout - end */

//             let cGraph = new CompoundGraph()
//             Object.keys(nodeMap).forEach(vNodeId => {
//                 let vNode = nodeMap[vNodeId]
//                 let cNode = cGraph.addNode('@ ' + vNode.id, vNode.nodes)
//                 let layout = dagreLayoutAlgo.nodeLayoutMap.get(vNode.id)
//                 cNode.setLayout({
//                     x: vNode.x0,
//                     y: layout.y / 5,
//                     height: state.LayoutConfig.vertexHeight,
//                     width: vNode.x1 - vNode.x0,
//                 })
//             })

//             Object.keys(childrenMap).forEach(vNodeId => {
//                 let children = childrenMap[vNodeId]
//                 children.forEach(child => {
//                     let cEdge = cGraph.addEdge('@ ' + child, '@ ' + vNodeId)
//                     let points = dagreLayoutAlgo.edgeLayoutMap.get(`${child}-${vNodeId}`)
//                     cEdge.setPoints(points)
//                 })
//             })

//             console.log(cGraph)

//             return cGraph
//         }
//         state.compoundGraph = computeCompoundGraph()

//         /* greedy layout - part 1 - end */

//         /* search based algorithm */
//         // let newVtxLaneMap = {}
//         // let gaspTime = xScale.invert(state.gapPixel) - xScale.invert(0)
//         //
//         // let timeOrderVertexes = [...state.vertexes]
//         // timeOrderVertexes.sort((v1, v2) => v1.startTime - v2.startTime)
//         // let conflictsMap = {}
//         // let minLaneNum = 0
//         // for (let i = 0; i < timeOrderVertexes.length; ++i) {
//         //     let conflicts = []
//         //     let curVertex = timeOrderVertexes[i]
//         //     for (let j = i + 1; j < timeOrderVertexes.length; ++j) {
//         //         let nxtVertex = timeOrderVertexes[j]
//         //         if (curVertex.endTime + gaspTime <= nxtVertex.startTime) {
//         //             break
//         //         }
//         //         conflicts.push(nxtVertex)
//         //     }
//         //     conflictsMap[curVertex.vertexName] = conflicts
//         //     minLaneNum = Math.max(minLaneNum, conflicts.length + 1)
//         // }
//         //
//         // console.log('minLaneNum', minLaneNum)
//         //
//         // for (let i = timeOrderVertexes.length - 1; i >= 0; --i) {
//         //     let vertex = timeOrderVertexes[i]
//         //
//         //     let invalidIdxSet = new Set()
//         //     for (let conflictVertex of conflictsMap[vertex.vertexName]) {
//         //         invalidIdxSet.add(newVtxLaneMap[conflictVertex.vertexName])
//         //     }
//         //     let validIdxList = []
//         //     for (let i = 0; i < minLaneNum; ++i) {
//         //         if (!invalidIdxSet.has(i)) {
//         //             validIdxList.push(i)
//         //         }
//         //     }
//         //     // peek a laneIdx
//         //     newVtxLaneMap[vertex.vertexName] = validIdxList[0]
//         // }
//         //
//         // console.log('newVtxLaneMap', newVtxLaneMap)
//         //
//         // state.vtxLaneMap = newVtxLaneMap

//         /* search based algorithm - end */

//         // native
//         // state.vtxLaneMap = (function () {
//         //     let vertexes = [...state.vertexes]
//         //     vertexes.sort((v1, v2) => v1.startTime - v2.startTime)
//         //     let newVtxLaneMap = {}
//         //     vertexes.forEach((v, i) => newVtxLaneMap[v.vertexName] = i)
//         //     return newVtxLaneMap
//         // })()

//         // baseline
//         // state.vtxLaneMap = (function () {
//         //     let newVtxLaneMap = {}
//         //     let laneIdx = 0;
//         //     state.orderedVertexIdx.forEach(vertexName => {
//         //         if (state.vertexMap[vertexName] != undefined) {
//         //             newVtxLaneMap[vertexName] = laneIdx ++
//         //         }
//         //     })
//         //     return newVtxLaneMap
//         // })()

//         /* greedy layout - part 2 */
//         // // optimize ctrl points
//         // let ctrlMap = layoutAlgo.ctrlMap
//         // let sortedVertexes = [...state.vertexes]
//         // sortedVertexes.sort((v1, v2) => v1.endTime - v2.endTime)
//         // let curTime = Number.MIN_SAFE_INTEGER
//         // let pushedTimeGap = xScale.invert(10) - xScale.invert(0)
//         // let visited = new Set()
//         //
//         // sortedVertexes.forEach(vtx => {
//         //     let maxCtrl = 0
//         //     let minEnd = Number.MAX_SAFE_INTEGER
//         //     state.parentsMap[vtx.vertexName].forEach(parent => {
//         //         let prtVertex = state.vertexMap[parent]
//         //         if (prtVertex == undefined) {
//         //             return
//         //         }
//         //         let ctrl = ctrlMap[state.orderMap[vtx.vertexName] + '_' + state.orderMap[parent]]
//         //         maxCtrl = Math.max(maxCtrl, ctrl)
//         //         if (prtVertex.startTime < ctrl) {
//         //             minEnd = Math.min(minEnd, prtVertex.endTime)
//         //         } else {
//         //             minEnd = Math.min(minEnd, prtVertex.startTime)
//         //         }
//         //     })
//         //     if (curTime + pushedTimeGap < maxCtrl) {
//         //         // can push to curTime
//         //         curTime = maxCtrl
//         //     } else if (curTime + 0.6 * pushedTimeGap < minEnd) {
//         //         // compute div part
//         //         let maxNoPushIn = 1     // must has this vertex
//         //         state.parentsMap[vtx.vertexName].forEach(parent => {
//         //             let noPushIn = 0
//         //             state.childrenMap[parent].forEach(child => {
//         //                 noPushIn += visited.has(child) ? 0 : 1
//         //             })
//         //             maxNoPushIn = Math.max(maxNoPushIn, noPushIn)
//         //         })
//         //         let computedGap = (minEnd - curTime - 0.4 * pushedTimeGap) / maxNoPushIn
//         //         curTime += computedGap
//         //         maxCtrl = curTime
//         //     }
//         //     state.parentsMap[vtx.vertexName].forEach(parent => {
//         //         let prtVertex = state.vertexMap[parent]
//         //         if (prtVertex == undefined) {
//         //             return
//         //         }
//         //         ctrlMap[state.orderMap[vtx.vertexName] + '_' + state.orderMap[parent]] = maxCtrl
//         //     })
//         //     visited.add(vtx.vertexName)
//         // })
//         //
//         // // update childTurningMap items
//         // state.renderEdges.forEach(edge => {
//         //     let srcId = state.orderMap[edge.srcVertexName],
//         //         dstId = state.orderMap[edge.dstVertexName]
//         //     let newCtrl = ctrlMap[srcId + '_' + dstId]
//         //     TweenLite.to(edge.layout, state.updateRate / 1000, {ctrl: xScale(newCtrl)})
//         // })

//         /* greedy layout - part 2 - end */

//         state.vertexes.forEach(vertex => {
//             // let _widtj=
//             let layout = {};
//             if (vertex.layout.x == 0) {
//                 vertex.layout.x = xScale(vertex.startTime);
//                 vertex.layout.mX = mXScale(vertex.startTime);
//             } else {
//                 layout.x = xScale(vertex.startTime);
//                 layout.mX = mXScale(vertex.startTime);
//             }
//             layout.width = xScale(vertex.endTime) - xScale(vertex.startTime);
//             let laneIdx = state.vtxLaneMap[vertex.vertexName]
//             if (vertex.layout.y == 0) {
//                 vertex.layout.y = laneIdx * state.LayoutConfig.vertexContainerHeight + state.LayoutConfig.marginTop;
//                 vertex.layout.mY = mYScale(vertex.endTime);
//             } else {
//                 layout.y = laneIdx * state.LayoutConfig.vertexContainerHeight + state.LayoutConfig.marginTop;
//                 layout.mY = mYScale(vertex.endTime);
//             }
//             let startX = 0;
//             // let stepLayout = []
//             let sumVal = d3.sum(vertex.steps);
//             TweenLite.to(vertex.layout, state.updateRate / 1000, layout)
//             vertex.steps.forEach((step, j) => {
//                 let stepWidth = sumVal == 0 ? 0 : (step / sumVal * layout.width);
//                 let stepLayoutObj = {
//                     x: startX,
//                     width: stepWidth,
//                     id: j,
//                     fill: state.LayoutConfig.stepColors[j],
//                     name: state.LayoutConfig.stepName[vertex.hvType][j]
//                 }
//                 if (vertex.stepLayout.length < vertex.steps.length) {
//                     vertex.stepLayout.push(stepLayoutObj)
//                 } else {
//                     TweenLite.to(vertex.stepLayout[j], state.updateRate / 1000, stepLayoutObj);
//                 }
//                 // stepLayout.push(stepLayoutObj)
//                 startX += stepWidth;
//             });
//             // vertex.stepLayout = stepLayout;
//             layout.height = state.LayoutConfig.vertexHeight;
//         })

//         state.renderSign = !state.renderSign
//     },
//     createVertex(state, task) {
//         this.commit('simulation/updateTask', task);
//         let steps = [];
//         task.time_len.forEach(d => steps.push(d));
//         let vertex = {
//             vertexName: task.vec_name,
//             startTime: task.start_time,
//             endTime: task.end_time,
//             hvType: task.hv_type,
//             steps: steps,
//             taskMap: {},
//             layout: {x: 0, y: 0, width: 0, height: 0, mX: 0, mY: 0, selected: false, selectToExtend: true, childMerge: 0},
//             stepLayout: [],
//             dagNode: state.dagData.vertexMap[task.vec_name],
//             ended: task.eov,
//         }
//         vertex.taskMap[task.task_id] = task;
//         vertex.tasks = [task];
//         state.vertexMap[vertex.vertexName] = vertex;
//         state.vertexes.push(vertex);

//         for (let i = 0, ilen = state.edges.length; i < ilen; i++) {
//             let edge = state.edges[i];
//             if (edge.srcVertexName == vertex.vertexName) {
//                 edge.srcRealNode = vertex;
//                 if (edge.dstRealNode != null) {
//                     state.renderEdges.push({...edge, layout:{ctrl: xScale(vertex.endTime)}})
//                 }
//             }
//             if (edge.dstVertexName == vertex.vertexName) {
//                 edge.dstRealNode = vertex;
//                 if (edge.srcRealNode != null) {
//                     state.renderEdges.push({...edge, layout:{ctrl: xScale(edge.srcRealNode.endTime)}})
//                 }
//             }
//         }
//         // console.log('layout: %o, %o', state.edges, state.renderEdges)
//         task.vertex = vertex;

//         // update position according to the relationship
//     },
//     updateVertex(state, task) {
//         //TODO: comments
//         this.commit('simulation/updateTask', task);
//         let currentVertex = state.vertexMap[task.vec_name];
//         task.vertex = currentVertex;
//         let task_id = task.task_id;
//         if (currentVertex.taskMap[task_id] == undefined) {
//             currentVertex.taskMap[task_id] = task;
//             currentVertex.tasks.push(task);
//             for (let i = 0, ilen = task.time_len.length; i < ilen; i++) {
//                 currentVertex.steps[i] += task.time_len[i];
//             }
//             task.fail = task.fail != undefined      // true if has this field
//         } else {
//             let preTask = currentVertex.taskMap[task_id];
//             for (let i = 0, ilen = task.time_len.length; i < ilen; i++) {
//                 currentVertex.steps[i] = currentVertex.steps[i] + task.time_len[i] - preTask.time_len[i];
//             }
//             preTask.end_time = task.end_time;
//             preTask.time_len = task.time_len;
//             preTask.fail = task.fail != undefined      // true if has this field
//         }
//         if (task.fail) {
//             console.log('task failed')
//         }
//         currentVertex.endTime = Math.max(task.end_time, currentVertex.endTime);
//         if (task.eov) {
//             currentVertex.ended = true
//         }
//     },
//     updateTask(state, task) {
//         if (state.maxTime == -1) {
//             state.maxTime = task.end_time;
//             state.minTime = task.start_time;
//             state.absMinTime = task.start_time;
//             state.absMaxTime = task.end_time;
//             state.vMaxTime = task.end_time + state.incTimeStep;
//             state.minTimeLength = task.end_time - task.start_time;
//             state.maxTimeLength = task.end_time - task.start_time;
//         } else {
//             state.maxTime = d3.max([task.end_time, state.maxTime]);
//             state.absMaxTime = state.maxTime;
//             state.minTime = d3.min([task.start_time, state.minTime]);
//             state.maxTimeLength = d3.max([task.end_time - task.start_time, state.maxTimeLength]);
//             state.minTimeLength = d3.min([task.end_time - task.start_time, state.minTimeLength]);
//             state.absMinTime = state.minTime;
//             if (state.maxTime > state.vMaxTime) {
//                 state.vMaxTime = state.maxTime + state.incTimeStep;
//             }
//         }
//         let task_id = task.task_id;
//         let machineId = task.machine_id;
//         if (state.machineMap[machineId] == undefined) {
//             let machine = {
//                 'machineId': machineId,
//                 'taskList': [],
//                 'taskCount': "",
//                 'status': [],
//             }
//             state.machineMap[machineId] = machine
//             state.machineList.push(machine)
//         }

//         let layout = {
//             y: 0,
//             x: 0,
//             selected: false,
//             selectedClick: false
//         };
//         if (state.taskMap[task_id] == undefined) {
//             task.selectedToExtend = false;
//             task.layout = layout;
//             state.taskList.push(task);
//             state.selectTaskList.push(task);
//             state.taskMap[task_id] = task;

//             // add task to machine
//             state.machineMap[machineId].taskList.push(task);

//         } else {
//             state.taskMap[task_id].end_time = task.end_time;
//         }
//     },
//     updateAllTask(state) {
//         state.taskList.forEach(task => {
//             this.commit('simulation/updateTask', task);
//         })
//     },
//     updateMonData(state, data) {

//         for (let machineId in data) {
//             let monList = data[machineId]
//             if (state.monData[machineId] == undefined) {
//                 state.monData[machineId] = monList
//             } else {
//                 let monData = state.monData[machineId]
//                 monList.forEach(item => monData.push(item))
//             }
//         }
//         for (let machineId in state.monData) {
//             if (state.machineMap[machineId]) {
//                 state.machineMap[machineId]['status'] = state.monData[machineId]
//                 // console.log('>>', state.machineMap[machineId]['status'].length)
//             }
//         }

//         // update disk Max value
//         let diskNames = Object.keys(state.metrics.diskMax);
//         let metrics = state.metrics.diskMetric;
//         if (Object.values(data).length > 0) {
//             metrics.forEach(metric => {
//                 diskNames.forEach(diskName => {
//                     state.metrics.diskMax[diskName][metric] = d3.max(Object.values(data),
//                         machineValue => d3.max(machineValue, d => d.iostat[diskName] == undefined ? 0 : d.iostat[diskName][metric]))
//                 })
//             })
//         }
//         // update netIO maxValue

//         let netMetrics = state.metrics.netIO;
//         if (Object.values(data).length > 0) {
//             netMetrics.forEach(metric => {
//                 state.metrics.netIOMax[metric] = d3.max(Object.values(data),
//                     machineValue => d3.max(machineValue, d => d.netIO[metric]))
//             })
//         }

//         state.renderSign = !state.renderSign
//     },
//     updateOutlierData(state, data) {
//         state.outlierData = data
//     },
//     updateFetch(state, {changes, ends}) {
//         changes.forEach(fetchInfo => {
//             state.fetchData.push(fetchInfo)
//         })
//         for (let taskId in ends) {
//             let fetchEnds = state.fetchEndMap[taskId];
//             if (fetchEnds == undefined) {
//                 fetchEnds = []
//                 state.fetchEndMap[taskId] = fetchEnds
//             }
//             let endVertexes = ends[taskId]
//             endVertexes.forEach(vertexName => {
//                 fetchEnds.push(vertexName)
//             })
//         }
//     },
//     fixTaskStepInfo(state, taskList) {
//         taskList.forEach(task => {
//             state.taskMap[task.task_id].step_info = task.step_info
//         })
//     },
//     updateCounters(state, {taskId, counter}) {
//         state.counters[taskId] = counter
//     },
//     // must have full fetch data. when call this, processDataFlow has been called
//     computeTransmission (state) {
//         console.log('compute transmitMap start')

//         let transmitMap = {}
//         let transmitted = new Set()         // set of transmitted vertex for ALL label
//         let machineIdxMap = {}
//         state.machineList.forEach((machine, i) => machineIdxMap[machine.machineId] = i)
//         let machineCnt = Object.keys(machineIdxMap).length
//         if (machineCnt === 0) {
//             return
//         }
//         state.fetchData.forEach(fetchInfo => {
//             let dstVtxName = fetchInfo.dstTask.vec_name,
//                 dstMachine = fetchInfo.dstTask.machine_id
//             let dstMachineIdx = machineIdxMap[dstMachine]

//             if (fetchInfo.label === 'NORMAL') {
//                 let srcVtxName = fetchInfo.srcTask.vec_name,
//                     srcMachine = fetchInfo.srcTask.machine_id
//                 let srcMachineIdx = machineIdxMap[srcMachine]

//                 let tsmSrc = getOrSetIfMiss(transmitMap, srcVtxName, {})
//                 let tsmSrcDst = getOrSetIfMiss(tsmSrc, dstVtxName, [])

//                 if (tsmSrcDst.length === 0) {       // init if is []
//                     for (let i = 0; i < machineCnt; i++) {
//                         let row = []
//                         for (let j = 0; j < machineCnt; j++) {
//                             row.push(0)
//                         }
//                         tsmSrcDst.push(row)
//                     }
//                 }
//                 tsmSrcDst[srcMachineIdx][dstMachineIdx] += fetchInfo.csize
//                 state.maxCSize = Math.max(state.maxCSize, fetchInfo.csize)

//             } else {        // is ALL
//                 let srcVtxName = fetchInfo.srcVtxName
//                 if (!transmitted.has(srcVtxName)) {
//                     fetchInfo.srcTasks.forEach(srcTask => {
//                         let srcVtxName = srcTask.vec_name,
//                             srcMachine = srcTask.machine_id
//                         let srcMachineIdx = machineIdxMap[srcMachine]

//                         let tsmSrc = getOrSetIfMiss(transmitMap, srcVtxName, {})
//                         let tsmSrcDst = getOrSetIfMiss(tsmSrc, dstVtxName, [])

//                         if (tsmSrcDst.length === 0) {       // init if is []
//                             for (let i = 0; i < machineCnt; i++) {
//                                 let row = []
//                                 for (let j = 0; j < machineCnt; j++) {
//                                     row.push(0)
//                                 }
//                                 tsmSrcDst.push(row)
//                             }
//                         }
//                         let srcTaskCounters = state.counters[srcTask['task_id']]
//                         let size = srcTaskCounters['OUTPUT_BYTES']
//                         tsmSrcDst[srcMachineIdx][dstMachineIdx] += size
//                         state.maxCSize = Math.max(state.maxCSize, size)
//                     })
//                     transmitted.add(srcVtxName)
//                 }
//             }
//         })
//         state.transmitData = transmitMap

//         console.log('fetchData: %o', state.fetchData)
//         console.log('transmitData: %o', state.transmitData)
//     },
//     // save task recv into task obj. {machineId: [recv]}
//     computeTaskRecvSend (state) {
//         state.fetchData.forEach(fetchInfo => {
//             let dstTask = state.taskMap[fetchInfo.dst],
//                 dstMachine = fetchInfo.dstTask.machine_id
//             let recvMap = getOrSetIfMiss(dstTask, 'recv', {})

//             if (fetchInfo.label === 'NORMAL') {
//                 let srcTask = state.taskMap[fetchInfo.src],
//                     srcMachine = fetchInfo.srcTask.machine_id
//                 let sendMap = getOrSetIfMiss(srcTask, 'send', {})

//                 getOrSetIfMiss(recvMap, srcMachine, []).push(fetchInfo)
//                 getOrSetIfMiss(sendMap, dstMachine, []).push(fetchInfo)

//             } else {        // is ALL
//                 fetchInfo.srcTasks.forEach(srcTask => {
//                     let srcMachine = srcTask.machine_id
//                     let sendMap = getOrSetIfMiss(srcTask, 'send', {})

//                     let srcTaskCounters = state.counters[srcTask['task_id']]
//                     let size = srcTaskCounters['OUTPUT_BYTES']

//                     let genFetchData = {
//                         ...fetchInfo,
//                         csize: size,
//                         src: srcTask.task_id,
//                         srcTask,
//                     }
//                     delete genFetchData['srcTasks']
//                     delete genFetchData['srcVtxName']

//                     getOrSetIfMiss(recvMap, srcMachine, []).push(genFetchData)
//                     getOrSetIfMiss(sendMap, dstMachine, []).push(genFetchData)
//                 })
//             }
//         })
//         console.log('after set recv / send, taskList: %o', state.taskList)
//     },


//     changeDataNames(state, dataNames) {
//         state.dataNames = dataNames;
//     },
//     changeDagNodes(state, dagData) {
//         console.log(state, dagData)
//     },
//     changeDagEdges(state, dagData) {
//         dagData.vertexes.forEach(vertex => {
//             vertex.layout = {selected: false}
//         })
//         dagData.vertexMap = {}
//         state.dagData = JSON.parse(JSON.stringify(dagData));
//         let orderedNodes = sortGraphNodes(dagData.vertexes, dagData.edges);
//         let orderedVertexIdx = [];
//         orderedNodes.forEach(node => orderedVertexIdx.push(node.vertex_name));
//         state.orderedVertexIdx = orderedVertexIdx;

//         /* setup info for greedy algorithm */
//         let childrenMap = {}, parentsMap = {}
//         let getChildren = function (node) {
//             let ret = []
//             node.children.forEach(child => {
//                 if (child.vdat.hv_type == null) {
//                     getChildren(child).forEach(grandChild => ret.push(grandChild))
//                 } else {
//                     ret.push(child)
//                 }
//             })
//             return ret
//         }

//         orderedNodes.forEach(node => parentsMap[node.vertex_name] = [])
//         orderedNodes.forEach(node => {
//             if (node.vdat.hv_type == null) {
//                 return
//             }
//             let children = getChildren(node)
//             let childrenNames = children.map(child => child.vertex_name)
//             childrenMap[node.vertex_name] = childrenNames

//             childrenNames.forEach(childName => {
//                 parentsMap[childName].push(node.vertex_name)
//             })
//         })
//         // sort them
//         let orderMap = {}       // vertex name -> order idx
//         orderedNodes.forEach((node, i) => orderMap[node.vertex_name] = i)
//         for (let vertexName in childrenMap) {
//             childrenMap[vertexName].sort((c1, c2) => orderMap[c1] - orderMap[c2])
//         }
//         for (let vertexName in parentsMap) {
//             parentsMap[vertexName].sort((p1, p2) => orderMap[p1] - orderMap[p2])
//         }
//         state.childrenMap = childrenMap
//         state.parentsMap = parentsMap
//         state.orderMap = orderMap
//         console.log('childrenMap', childrenMap)
//         console.log('parentsMap', parentsMap)

//         //TODO: start
//         //
//         let nodes = dagData.vertexes;
//         let rawEdges = dagData.edges;
//         let idMap = {};
//         state.dagData.vertexMap = {}
//         nodes.forEach(node => {
//             state.dagData.vertexMap[node.vdat.vertex_name] = node;
//             idMap[node.idx] = node;
//             node.srcNodes = [];
//             node.dstNodes = [];
//         });
//         let edges = [];
//         rawEdges.forEach(edge => {
//             edge.srcNode = idMap[edge.src];
//             edge.dstNode = idMap[edge.dst];
//             if (!edge.srcNode.dstEdges) {
//                 edge.srcNode.dstEdges = [];
//             }
//             edge.srcNode.dstEdges.push(edge);
//             if (!edge.dstNode.srcEdges) {
//                 edge.dstNode.srcEdges = [];
//             }
//             edge.dstNode.srcEdges.push(edge);
//         });
//         rawEdges.forEach(edge => {
//             edge.srcNode.dstNodes.push(edge.dstNode);
//             edge.dstNode.srcNodes.push(edge.srcNode);
//         })

//         let run = true;
//         let getOtherTypeNode = function (nodes) {
//             for (let i = 0, ilen = nodes.length; i < ilen; i++) {
//                 let hv_type = nodes[i].vdat.hv_type;
//                 if (hv_type != 'Map' && hv_type != 'Reducer') {
//                     return i
//                 }
//             }
//             return false
//         }
//         while (run) {
//             let index = getOtherTypeNode(nodes);
//             if (index === false) {
//                 run = false;
//                 break
//             }
//             let currentNode = nodes.splice(index, 1)[0];
//             let srcNodes = currentNode.srcNodes;
//             let dstNodes = currentNode.dstNodes;
//             srcNodes.forEach(srcNode => {
//                 dstNodes.forEach(dstNode => {
//                     srcNode.dstNodes = srcNode.dstNodes.filter(node => node != currentNode);
//                     srcNode.dstNodes.push(dstNode);
//                     dstNode.srcNodes = dstNode.srcNodes.filter(node => node != currentNode);
//                     dstNode.srcNodes.push(srcNode);
//                 })
//             })
//         }

//         nodes.forEach((srcNode) => {
//             srcNode.dstNodes.forEach(dstNode => {
//                 let edge = {
//                     src: srcNode.idx,
//                     dst: dstNode.idx,
//                     srcNode: srcNode,
//                     dstNode: dstNode,
//                     idx: srcNode.idx + '_' + dstNode.idx,
//                     srcVertexName: srcNode.vertex_name,
//                     dstVertexName: dstNode.vertex_name,
//                     srcRealNode: null,
//                     dstRealNode: null
//                 }
//                 edges.push(edge)
//             })
//         })
//         state.edges = edges;
//         //TODO: end;

//         let root = nodes[0]
//         while (root.parent.length !== 0) {
//             root = root.parent[0]
//         }
//         state.dagRoot = root.vertex_name
//     },
//     processDataFlow(state) {
//         state.fetchData.forEach(dict=>{
//             if (dict.label === 'NORMAL') {
//                 dict.srcTask = state.taskMap[dict.src];
//                 dict.dstTask = state.taskMap[dict.dst];
//             } else {
//                 // src are all tasks from srcVtxName
//                 dict.srcTasks = state.vertexMap[dict.srcVtxName].tasks
//                 dict.dstTask = state.taskMap[dict.dst];
//             }
//         })
//         state.dataFlow = state.fetchData
//         state.renderSign = !state.renderSign
//     },
//     changeSqlData(state, sqlData) {
//         state.sqlData = sqlData
//     },
//     changeInLoading (state, inLoading) {
//         state.inLoading = inLoading
//     },

//     changeTimeHandler(state, {timeHandler}) {
//         state.timeHandler = timeHandler
//     },
//     changeSimRate(state, simRate) {
//         state.simRate = simRate
//     },
//     changeSimRunning(state, running) {
//         state.simRunning = running
//     },
//     changeMonRunning(state, running) {
//         state.monRunning = running
//     },
//     changeSimDataName(state, simDataName) {
//         state.simDataName = simDataName
//     },
//     changeShowDataflow(state, showDataflow) {
//         state.showDataflow = showDataflow
//     },
//     changeShowCompound(state, showCompound) {
//         state.showCompound = showCompound
//     },

//     updateTaskScale(state, region) {
//         mXScale.range([matrixLayoutCOnfig.marginLeft, region.width - matrixLayoutCOnfig.marginRight]);
//         mYScale.range([matrixLayoutCOnfig.marginTop, region.height - matrixLayoutCOnfig.marginBottom]);
//         matrixLayoutCOnfig.upperHeight = region.upperHeight;
//     },

//     updateIncrementalScale(state, region) {
//         LayoutConfig.width = region.width;
//         LayoutConfig.height = region.height - 20;
//         xScale.range([LayoutConfig.marginLeft, LayoutConfig.width - LayoutConfig.marginRight]);
//     },
//     estimationIncrementalContainerHeight(state, nVertex) {
//         LayoutConfig.vertexContainerHeight = Math.max((LayoutConfig.height - 50) / nVertex, 45);
//         LayoutConfig.vertexContainerHeight = Math.min(30, LayoutConfig.vertexContainerHeight);

//         LayoutConfig.vertexHeight = (LayoutConfig.vertexContainerHeight - 6) * 0.8
//     },
//     getTaskCountByTaskList(state, tasks) {
//         let usage = [];
//         let trend = [];
//         let count = 0;
//         tasks.forEach(task => {
//             usage.push({'type': 'start', 'time': task.start_time});
//             usage.push({'type': 'end', 'time': task.end_time});
//         })
//         usage.sort((a, b) => (a.time > b.time) ? 1 : -1);

//         usage.forEach(u => {
//             if (u.type == 'start') {
//                 count += 1;
//             } else if (u.type == 'end') {
//                 count -= 1;
//             } else {
//                 console.log('error type')
//             }
//             if (trend.length > 0 && trend[trend.length - 1].time == u.time) {
//                 trend[trend.length - 1].count = count;
//             } else {
//                 trend.push({'time': u.time, 'count': count})
//             }
//         })

//         let _render = [];
//         trend.forEach((u, i) => {
//             if (i != 0) {
//                 _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
//             }
//             _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
//         })
//         state.selectTaskCount = dLine(_render);
//     },
//     hoverVertex(state, vertex) {
//         if (typeof vertex == 'string') {
//             vertex = state.vertexMap[vertex]
//         }
//         if (vertex == undefined) {
//             return
//         }
//         vertex.layout.selected = true;
//         state.vertexes.forEach(vertex => {
//             vertex.tasks.forEach(task => {
//                 task.layout.selected = false;
//             })
//         })
//         vertex.tasks.forEach(task => {
//             task.layout.selected = true;
//         })

//         let startTimeRange = d3.extent(vertex.tasks, task => task.start_time);
//         let endTimeRange = d3.extent(vertex.tasks, task => task.end_time);

//         // should be put together

//         state.timeSelection.startTime = state.timeSelection.minStartTime = startTimeRange[0];
//         state.timeSelection.maxStartTime = startTimeRange[1];
//         state.timeSelection.minEndTime = endTimeRange[0];
//         state.timeSelection.endTime = state.timeSelection.maxEndTime = endTimeRange[1];


//         this.commit('simulation/getTaskCountByTaskList', vertex.tasks);
//     },
//     hoverOutVertex(state, vertex) {
//         if (typeof vertex == 'string') {
//             vertex = state.vertexMap[vertex]
//         }
//         if (vertex == undefined) {
//             return
//         }
//         vertex.layout.selected = false;
//         vertex.tasks.forEach(task => {
//             task.layout.selected = false;
//         })

//         state.machineList.forEach(machine => machine.selectTaskCount = "")
//         // should be put together
//         state.timeSelection.startTime = -1;
//         state.timeSelection.endTime = -1;
//         state.timeSelection.x1 = 0;
//         state.timeSelection.x2 = 0;
//         state.timeSelection.y1 = 0;
//         state.timeSelection.y2 = 0;
//     },
//     selectVertex(state,vertex){

//         if(vertex == state.selectedVertex){
//             state.selectedVertex = null;
//         }else{
//             state.selectedVertex = vertex;
//         }

//     }
// }

// export default {
//     namespaced: true,
//     state,
//     getters,
//     actions,
//     mutations
// }
