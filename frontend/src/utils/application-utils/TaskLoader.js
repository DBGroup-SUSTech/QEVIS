import * as d3 from "d3";
import {Task} from "@/utils/entities/Task";
import {Machine} from "@/utils/entities/Machine";

export function loadStaticTasks(app, fullTasks) {
    fullTasks.forEach(rawTask => {
        if (app.machineMap.has(rawTask.machine)) {
            return;
        }
        const machine = new Machine(rawTask.machine);
        app.machines.push(machine);
        app.machineMap.set(rawTask.machine, machine);
    });
    const tasks = fullTasks.map(rawTask => {
        const t = new Task();
        t.tid = rawTask.tid;
        t.vertex = app.vertexMap.get(rawTask.vid);
        t.machine = app.machineMap.get(rawTask.machine);
        t.suffix = rawTask.suffix;
        t.start = rawTask.start;
        t.end = rawTask.end;
        t.fail = rawTask.fail;
        return t;
    });
    tasks.forEach(task => {
        app.tasks.push(task);
        app.taskMap.set(task.tid, task);

        const vertex = task.vertex;
        vertex.tasks.push(task);
        vertex.start = vertex.start ? Math.min(vertex.start, task.start) : task.start;
        vertex.end = vertex.end ? Math.max(vertex.end, task.end) : task.end;

        const machine = task.machine;
        machine.tasks.push(task);
        machine.vidSet.add(vertex.vid);
    });

    app.duration = d3.max(tasks, t => t.end);
    app.visDuration = app.duration;
}

export function loadStaticTaskStepInfo(app, stepInfo) {
    const taskMap = app.taskMap;
    // console.log(taskMap, stepInfo)
    stepInfo.forEach(step => {
        const task = taskMap.get(step.tid);
        if (!task.stepMap) {
            task.stepMap = new Map();
        }
        const stepObj = {type: step.type, start: step.t1, end: step.t2};
        task.stepMap.set(step.type, stepObj);
    })
}

export function loadStaticCounters(app, counters) {
    const counterKeys = [];
    const counterKeySet = new Set();
    counters.forEach(raw => {
        const content = raw.content ? JSON.parse(raw.content) : {};
        const task = app.taskMap.get(raw.tid);

        task.counter = {};
        Object.keys(content).forEach(key => {
            task.counter[key] = parseInt(content[key]);
        });

        Object.keys(content).forEach(key => {
            if (key.match(/.*\d.*/)) {
                return;
            }
            if (counterKeySet.has(key)) {
                return;
            }
            counterKeys.push(key);
            counterKeySet.add(key);
        });
    });

    app.counterKeys = counterKeys;
}
