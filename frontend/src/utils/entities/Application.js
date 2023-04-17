import * as d3 from "d3";
import {LayoutConfig} from "@/utils/const/LayoutConfig";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";
import {AnimationStatus} from "@/utils/const/AnimationStatus";
import {TDAGModel} from "@/utils/entities/TDAGModel";
import {TreeModel} from "@/utils/entities/TreeModel";
import {TaskMatrixModel} from "@/utils/entities/TaskMatrixModel";
import {TransferCache} from "@/utils/entities/TransferCache";

export class Application {
    /* basic information from backend */
    aid
    appId
    databaseName
    queryName
    queryString
    queryPlan
    queryDag
    createTime
    status
    duration
    machineNo
    mapNo
    reducerNo
    taskNo
    referenceTime
    taskIdPrefix

    /* vertex instances */

    /** @type{Vertex[]} */
    vertexes = []
    /** @type{Map<number, Vertex>} */
    vertexMap = new Map()
    /** @type{Vertex} */
    dagRoot
    /** @type {Edge[]} */
    edges = []

    /** @type{Machine[]} */
    machines = []
    /** @type{Map<string, Machine>} */
    machineMap = new Map()

    /** @type{Task[]} */
    tasks = []
    /** @type{Map<number, Task>} */
    taskMap = new Map();
    /** @type {string[]} */
    counterKeys = [];

    /** @type {Transfer[]} */
    abnormalTransfers = [];
    /** @type {TransferCache} */
    transferCache = new TransferCache();
    /** @type {number} */
    maxCSize;

    /** @type{TDAGModel} */
    tdagModel

    /** @type {TreeModel} */
    treeModel

    /** @type {TaskMatrixModel} */
    mainTaskMatrixModel = null;
    /** @type {TaskMatrixModel[]} */
    taskMatrixModels = [];

    /** @type {string[]} */
    selectedMachines = [];

    diagnoseData = null;
    /** @type {Task} */
    onlyOneHighlightTask = null;

    signs = {
        dagSign: 0,
        tdagSign: 0,
        taskListSign: 0,
        matrixSign: 0,
        taskListHighlightSign: 0,
    }

    /* interaction */
    showProgress = true;
    showStepView = false;
    showPerformance = 0;

    /* animation */

    /** @type {AnimationStatus} */
    animationStatus = AnimationStatus.NONE;
    /** @type {number | null} */
    timeHandlerId = null
    updateRate = 500        // ms
    ackTime = 0             // ms
    ackRealTime = null
    pauseRealTime = null;
    speedRatio = 1.0;

    visDuration;

    /** @type {Object[]} */
    transferUpdateCache = [];

    showOverviewMatrix = true;

    // ----------------------------

    monData = {}        // monitor data for each machine
    counters = {}       // counter map for each task

    fetchData = []      // fetch info from task to task.
    fetchEndMap = {}    // the finished input of task from a vertex. taskId -> list of vertexName


    orderMap = {}               // const
    orderedVertexIdx = []       // const

    childrenMap = {}           // const, parent vtxName -> list of children
    parentsMap = {}            // const, child vtxName -> list of parents
    vtxLaneMap = {}

    taskCount = ""

    depTaskMaps = {
        srcTaskMap: {},
        dstTaskMap: {},
        srcDepMap: {},
        dstDepMap: {}
    }
    selectTaskList = []

    diagnoseMatrix = {}

    isLoading = false
    totalLoading = false

    overviewMatrix = false
    selectedMachineMetrics = {}

    isTaskListProcessed = false

    interactiveModule = {
        selectedTasks: [],
        selectedDeps: [],
        srcAffectedTasks: [],
        dstAffectedTasks: [],
        srcAffectedDeps: [],
        dstAffectedDeps: []
    }

    abnormalDeps = []

    absMaxTime = -1
    absMinTime = -1
    minTime = -1
    maxTime = -1
    vMaxTime = -1
    minTimeLength = Number.MAX_VALUE
    maxTimeLength = -1

    minDataSize = Number.MAX_VALUE
    maxDataSize = -1

    machineList = []
    // machineMap = {}

    dataFlow = []

    selectTaskCount = ''
    timeSelection = {
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
    }

    renderEdges = []

    metrics = metrics

    // interaction start >>>>>>
    taskViewSelects = []
    // interaction end <<<<<<<<

    // linkColorPool: d3.schemeCategory10,

    hGraph = null
    visGraph = null
    updateTDADGSign = true

    clusterNumber = 1
    mergeCount = 0
    xScale
    mXScale
    mYScale
    mTYScale

    tdagCursorMode = TDAGCursorMode.NORMAL

    matrixRefDuration = null

    renderSign = false
    renderAxis = false

    // layout

    taskLoaded = false
    monitorDataLoaded = false

    // show detail or not in DAG diagram
    showDetail = false

    dagDiagramCollapse = true

    // tdagTransform = null
    appendCtxType = "Nothing"

    constructor() {
        this.xScale = d3.scaleLinear().range([LayoutConfig.marginLeft, LayoutConfig.width - LayoutConfig.marginRight]);
        this.mXScale = d3.scaleLinear().range([matrixLayoutConfig.marginLeft, matrixLayoutConfig.width - matrixLayoutConfig.marginRight]);
        this.mYScale = d3.scaleLinear().range([matrixLayoutConfig.marginTop, matrixLayoutConfig.height - matrixLayoutConfig.marginBottom]);
        this.mTYScale = d3.scaleLinear().range([matrixLayoutConfig.marginTop, matrixLayoutConfig.height - matrixLayoutConfig.marginBottom]);
    }

    changeRenderSign() {
        this.renderSign ^= true
    }

    getRealStartTime() {
        return this.referenceTime;
    }

    getRealEndTime() {
        return this.referenceTime + this.duration;
    }

    resetForAnimation(tdagViewWidth) {
        this.duration = 0;
        this.visDuration = 0;
        this.vertexes.forEach(v => {
            v.start = null;
            v.end = null;
            v.tasks = [];
        });
        this.tasks = [];
        this.taskMap = new Map();
        this.machines = [];
        this.machineMap = new Map();
        this.tdagModel = new TDAGModel(this);
        this.tdagModel.resizeXScale(tdagViewWidth)
        this.treeModel = new TreeModel(this);
        this.mainTaskMatrixModel = new TaskMatrixModel(this, null);
        this.taskMatrixModels = [];

        this.abnormalTransfers = [];
        this.transferUpdateCache = [];

        this.signs.taskListSign ^= 1;
    }

    computeTransferMaxCSize() {
        let maxCSize = 0;
        this.abnormalTransfers.forEach(tran => {
            if (tran.type === 'normal') {
                if (tran.src.end <= tran.dst.start) {
                    return;
                }
                maxCSize = Math.max(maxCSize, tran.csize);
            } else {
                tran.srcV.tasks.forEach(src => {
                    if (src.end <= tran.dst.start) {
                        return;
                    }
                    maxCSize = Math.max(maxCSize, src.counter['OUTPUT_BYTES']);
                });
            }
        });
        this.maxCSize = maxCSize;
    }
}


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

const matrixLayoutConfig = {
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

