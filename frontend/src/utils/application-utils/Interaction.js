import {HighlightMode as HM} from "@/utils/const/HightlightMode";


/**
 * @param {Application} app
 * @param {Vertex} vertex
 * @param {boolean=true} toHighlight
 */
export function changeHighlightVertex(app, vertex, toHighlight=true) {
    vertex.interact.highlightMode = toHighlight ? HM.CURRENT : HM.NONE;
    vertex.srcVertexes.forEach(v => v.interact.highlightMode = toHighlight ? HM.PROVIDER : HM.NONE);
    vertex.dstVertexes.forEach(v => v.interact.highlightMode = toHighlight ? HM.CONSUMER : HM.NONE);

    vertex.tasks.forEach(t => t.interact.highlightMode = toHighlight ? HM.CURRENT : HM.NONE);
    vertex.srcVertexes.forEach(v => {
        v.tasks.forEach(t => t.interact.highlightMode = toHighlight ? HM.PROVIDER : HM.NONE);
    });
    vertex.dstVertexes.forEach(v => {
        v.tasks.forEach(t => t.interact.highlightMode = toHighlight ? HM.CONSUMER : HM.NONE);
    });

    app.abnormalTransfers.forEach(tran => {
        let affected = false;
        if (tran.type === 'all') {
            if (tran.srcV === vertex || tran.dst.vertex === vertex) {
                affected = true;
            }
        } else {
            if (tran.src.vertex === vertex || tran.dst.vertex === vertex) {
                affected = true;
            }
        }
        tran.highlight = affected && toHighlight;
    });

    app.mainTaskMatrixModel?.updateHighlightGroups();
    app.taskMatrixModels.forEach(model => model.updateHighlightGroups());

    app.signs.taskListHighlightSign ^= 1;
}


/**
 * @param {Application} app
 * @param {Task} task
 * @param {boolean=true} toHighlight
 */
export function changeHighlightTask(app, task, toHighlight=true) {
    task.interact.highlightMode = toHighlight ? HM.CURRENT : HM.NONE;

    const vertex = task.vertex;
    vertex.interact.highlightMode = toHighlight ? HM.CURRENT : HM.NONE;
    vertex.srcVertexes.forEach(v => v.interact.highlightMode = toHighlight ? HM.PROVIDER : HM.NONE);
    vertex.dstVertexes.forEach(v => v.interact.highlightMode = toHighlight ? HM.CONSUMER : HM.NONE);

    vertex.srcVertexes.forEach(v => {
        v.tasks.forEach(t => t.interact.highlightMode = toHighlight ? HM.PROVIDER : HM.NONE);
    });
    vertex.dstVertexes.forEach(v => {
        v.tasks.forEach(t => t.interact.highlightMode = toHighlight ? HM.CONSUMER : HM.NONE);
    });

    app.abnormalTransfers.forEach(tran => {
        let affected = false;
        if (tran.type === 'all') {
            if (tran.srcV === vertex || tran.dst === task) {
                affected = true;
            }
        } else {
            if (tran.src === task || tran.dst === task) {
                affected = true;
            }
        }
        tran.highlight = affected && toHighlight;
    });

    app.mainTaskMatrixModel?.updateHighlightGroups();
    app.taskMatrixModels.forEach(model => model.updateHighlightGroups());

    app.signs.taskListHighlightSign ^= 1;

    app.onlyOneHighlightTask = toHighlight ? task : null;
}
