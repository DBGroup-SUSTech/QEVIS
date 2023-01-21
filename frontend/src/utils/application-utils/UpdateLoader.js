import * as d3 from 'd3';
import {Task} from "@/utils/entities/Task";
import {Machine} from "@/utils/entities/Machine";
import {Edge} from "@/utils/entities/Edge";
import {LayoutConfig} from "@/utils/const/LayoutConfig";
import {TaskMatrixModel} from "@/utils/entities/TaskMatrixModel";
import {Record} from "@/utils/entities/Record";
import {Transfer} from "@/utils/entities/Transfer";


/**
 *
 * @param {Application} app
 * @param {Object[]} newRawTasks
 * @param {Object[]} events
 * @param {Object[]} rawRecords
 * @param {Object[]} abnormalTransferList
 * @param {Object[]} counters
 */
export function loadDynamic(app, newRawTasks, events, rawRecords, abnormalTransferList, counters) {

    /* create machine obj & transform raw task obj */

    newRawTasks.forEach(rawTask => {
        if (app.machineMap.has(rawTask.m)) {
            return;
        }
        const machine = new Machine(rawTask.m);
        app.machines.push(machine);
        app.machineMap.set(machine.machineName, machine);

        app.taskMatrixModels.push(new TaskMatrixModel(app, machine));
    });

    /** @type {Task[]} */
    const newTasks = newRawTasks.map(rawTask => {
        const t = new Task();
        t.tid = rawTask.tid;
        t.vertex = app.vertexMap.get(rawTask.vid);
        t.machine = app.machineMap.get(rawTask.m);
        t.suffix = rawTask.tis;
        // t.start = rawTask.start;
        // t.end = rawTask.end;
        // not to consider failed task in animation
        return t;
    });

    /* update app main resource */

    newTasks.forEach(task => {
        // update app resource
        app.tasks.push(task);
        app.taskMap.set(task.tid, task);

        // update vertex resource
        task.vertex.tasks.push(task);

        // update machine resource
        const machine = task.machine;
        machine.tasks.push(task);
        machine.vidSet.add(task.vertex.vid);
    });

    rawRecords.forEach(rawRecord => {
        const r = new Record();
        r.timestamp = rawRecord.t;
        r.machine = rawRecord.m;
        const {perCpuPercent, mem, iostat, netIO} = JSON.parse(rawRecord.c);
        r.cpu = perCpuPercent;
        r.mem = mem;
        r.io = iostat;
        r.net = netIO;

        if (app.machineMap.has(r.machine)) {
            app.machineMap.get(r.machine).records.push(r);
        } else {
            // console.warn('Machine ' + r.machine + ' is not exists');
        }
    });

    /* update tasks using events, setting time information */

    d3.nest()
        .key(event => event.tid)
        .entries(events)
        .forEach(taskGroup => {
            const tid = parseInt(taskGroup.key);
            const events = taskGroup.values;

            const task = app.taskMap.get(tid);
            const minTime = d3.min(events, e => e.st);
            const maxTime = d3.max(events, e => e.et);
            task.vertex.start = task.vertex.start ? Math.min(task.vertex.start, minTime) :minTime;
            task.vertex.end = task.vertex.end ? Math.max(task.vertex.end, maxTime) : maxTime;
            task.start = task.start ? Math.min(task.start, minTime) : minTime;
            task.end = task.end ? Math.max(task.end, maxTime) : maxTime;

            events.forEach(e => {
                const stepType = /** @type {StepType} */ e.type;
                if (!task.stepMap) {
                    task.stepMap = new Map();
                }
                if (!task.stepMap.has(stepType)) {
                    task.stepMap.set(stepType, {type: stepType, start: e.st, end: e.et});
                } else {
                    const step = task.stepMap.get(stepType);
                    step.start = Math.min(step.start, e.st);
                    step.end = Math.max(step.end, e.et);
                }
            })
        });

    const maxTime = d3.max(events, e => e.et) ?? 0;

    app.duration = app.duration ? Math.max(app.duration, maxTime) : maxTime;

    if (!app.visDuration || app.duration >= app.visDuration) {
        app.visDuration = 1.08 * app.duration;
    }

    /* update TDAG model */
    updateTDAGModel(app, newTasks);

    /* update tree model */
    updateTreeModel(app, newTasks);

    updateAbnormalTransfers(app, abnormalTransferList);

    /* update matrix model */
    updateMatrixModel(app, newTasks);

    updateCounters(app, counters);
}

function updateTDAGModel(app, newTasks) {
    const includeVertexes = Array.from(new Set(newTasks.map(t => t.vertex)));
    const tdagModel = app.tdagModel;
    tdagModel.startTime = 0;
    tdagModel.endTime = tdagModel.endTime ? Math.max(tdagModel.endTime, app.visDuration) : app.visDuration;
    // console.log(tdagModel.xScale.domain())
    // tdagModel.queryBarLen = tdagModel.endTime /
    includeVertexes.forEach(v => {
        tdagModel.vertexMap.get(v.vid).toRender = true;
        v.srcVertexes.forEach(srcV => {
            if (srcV._tdagViewObj.toRender) {
                const edgeTDAG = tdagModel.edgeMap.get(Edge.computeEdgeId(srcV, v));
                edgeTDAG.toRender = true;
            }
        });
        v.dstVertexes.forEach(dstV => {
            if (dstV._tdagViewObj.toRender) {
                const edgeTDAG = tdagModel.edgeMap.get(Edge.computeEdgeId(v, dstV));
                edgeTDAG.toRender = true;
            }
        });
    });
}

function updateTreeModel(app, newTasks) {
    const treeModel = app.treeModel;
    const {unitHeight, detailHeight} = LayoutConfig;
    const nestData = d3.nest()
        .key(task => task.vertex.vertexName)
        .key(task => task.machine.machineName)
        .entries(newTasks);

    nestData.forEach(vertexGroup => {
        const vertexName = vertexGroup.key;
        const vertexObj = app.vertexes.find(v => v.vertexName === vertexName);
        let vertexTreeModel;
        const values = vertexGroup.values;     // machine data

        if (!treeModel.vertexTreeModelMap.has(vertexObj.vid)) {
            vertexTreeModel = vertexObj.createTreeViewObj();
            vertexTreeModel.vertexName = vertexName;
            vertexTreeModel.config = {
                outerSelect: false,
                height: unitHeight,
                totalHeight: unitHeight,
                detailHeight: detailHeight,
                unitHeight: unitHeight
            };
            treeModel.vertexTreeModelList.push(vertexTreeModel);
            treeModel.vertexTreeModelMap.set(vertexTreeModel.vid, vertexTreeModel);
        } else {
            vertexTreeModel = treeModel.vertexTreeModelMap.get(vertexObj.vid);
        }

        values.forEach(machineGroup => {
            const machineName = machineGroup.key;
            const machineObj = app.machineMap.get(machineName);
            let machineTreeModel;
            const values = machineGroup.values;     // task data

            if (!vertexTreeModel.machineTreeModelMap.has(machineName)) {
                machineTreeModel = machineObj.createTreeViewObj();
                machineTreeModel.vertexName = vertexName;
                machineTreeModel.machineName = machineName;
                machineTreeModel.config = {
                    outerSelect: false,
                    height: unitHeight,
                    totalHeight: unitHeight,
                    detailHeight: detailHeight,
                    unitHeight: unitHeight
                };
                vertexTreeModel.machineTreeModelList.push(machineTreeModel);
                vertexTreeModel.machineTreeModelMap.set(machineName, machineTreeModel);
            } else {
                machineTreeModel = vertexTreeModel.machineTreeModelMap.get(machineName);
            }

            values.forEach(task => {
                const taskTreeModel = task.createTreeViewObj();
                taskTreeModel.vertexName = vertexName;
                taskTreeModel.machineName = machineName;
                taskTreeModel.config = {
                    outerSelect: false,
                    height: unitHeight,
                    totalHeight: unitHeight,
                    detailHeight: detailHeight,
                    unitHeight: unitHeight
                };

                machineTreeModel.taskTreeModelList.push(taskTreeModel);
            });
        });
    });
}

/**
 * Must run after updateAbnormalTransfers
 * @param app
 * @param newTasks
 */
function updateMatrixModel(app, newTasks) {
    app.mainTaskMatrixModel.taskMatrixVOList.push(...newTasks.map(t => t.createMatrixViewObj()));

    const modelMap = new Map();
    app.taskMatrixModels.forEach(model => modelMap.set(model.machine.machineName, model));

    newTasks.forEach(t => {
        const model = modelMap.get(t.machine.machineName);
        model.taskMatrixVOList.push(t.createMatrixViewObj());
    });

    app.mainTaskMatrixModel.transferList = app.abnormalTransfers;
    app.taskMatrixModels.forEach(model => {
        const vidSet = model.machine.vidSet;
        const machine = model.machine;
        const transferList = [];
        app.abnormalTransfers.forEach(tran => {
            if (tran.type === 'all') {
                if (vidSet.has(tran.srcV.vid) || tran.dst.machine === machine) {
                    transferList.push(tran);
                }
            } else {
                if (tran.src.machine === model || tran.dst.machine === machine) {
                    transferList.push(tran);
                }
            }
        });
        model.transferList = transferList;
    });

    app.computeTransferMaxCSize();
}

/**
 * @param {import('@/utils/entities/Application').Application} app
 * @param {Object[]} abnormalTransferList
 */
function updateAbnormalTransfers(app, abnormalTransferList) {
    abnormalTransferList.push(...app.transferUpdateCache);
    app.transferUpdateCache = [];

    abnormalTransferList.forEach(raw => {
        let newObject = null;
        if ('src_v' in raw) {
            if (app.taskMap.has(raw.dst)) {
                newObject = Transfer.createAllType(
                    app.vertexMap.get(raw.src_v),
                    app.taskMap.get(raw.dst),
                    raw.end,
                    true,
                );
            }
        } else {
            if (app.taskMap.has(raw.src) && app.taskMap.has(raw.dst)) {
                newObject = Transfer.createNormalType(
                    app.taskMap.get(raw.src),
                    app.taskMap.get(raw.dst),
                    raw.start,
                    raw.end,
                    parseInt(raw.csize),
                    true,
                );
            }
        }
        if (newObject !== null) {
            app.abnormalTransfers.push(newObject);
        } else {
            app.transferUpdateCache.push(raw);
        }
    })
}

function updateCounters(app, counters) {
    counters.forEach(c => {
        app.taskMap.get(c.tid).counter = {OUTPUT_BYTES: c.ob};
    });
}

