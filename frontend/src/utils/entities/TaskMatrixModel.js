import {BufferAttrName, CanvasEventType, MainObjectName, TaskMatrixSystem} from "@/utils/entities/TaskMatrixSystem";
import * as d3 from 'd3'
import {HighlightMode} from "@/utils/const/HightlightMode";
import {computeUUID} from "@/utils/utils/uuid";
import * as THREE from 'three';

const FAIL_MODE_NAME = 'fail';

export class TaskMatrixModel {
    /** @type {Application} */
    application
    /** @type {Machine | null} */
    machine = null;
    /** @type {TaskMatrixVO[]} */
    taskMatrixVOList = [];
    /** @type {Transfer[]} */
    transferList = [];

    /** @type {Map<HighlightMode, TaskMatrixVO[]>} */
    highlightTaskGroupMap = null;
    highlightTaskGroupUUID;

    lastRenderedGroupUUID;

    /** @type {number[]} */
    vertices = [];
    /** @type {number[]} */
    colors = [];

    /** @type {TaskMatrixSystem} */
    system;

    /** @type {d3.scaleLinear} */
    xScale;
    /** @type {d3.scaleLinear} */
    yScale;

    colorSchema;
    /** @type {(HighlightMode | string)[]} */
    highlightModes = [
        HighlightMode.PROVIDER,
        HighlightMode.CURRENT,
        HighlightMode.CONSUMER,
        FAIL_MODE_NAME,
    ];
    highlightColors = [];

    maxSelectedDuration = null;

    /**
     * @param {Application} application
     * @param {Machine=null} machine
     */
    constructor(application, machine = null) {
        this.application = application;
        this.machine = machine;
        this.xScale = d3.scaleLinear();
        this.yScale = d3.scaleLinear();
        this.system = new TaskMatrixSystem();

        this.highlightTaskGroupMap = new Map();
        this.highlightModes.forEach(mode => this.highlightTaskGroupMap.set(mode, []));
        this.highlightTaskGroupUUID = computeUUID();
    }

    /**
     * @param {HTMLElement} container
     * @param {number} padding
     * @param {Object} colorSchema
     */
    init(container, padding, colorSchema) {
        this.system.init(container);
        const {height, width} = container.getBoundingClientRect();

        const left = -width + padding;
        const right = width - padding;
        const up = height - padding;
        const down = -height + padding;
        this.xScale.range([left, right]);
        this.yScale.range([up, down]);

        const points = [
            [up, left],
            [up, right],
            [down, right],
            [down, left],
            [up, left],
        ];
        this.system.addLines('box', {
            colorStyle: 'grey',
            positions: points.flatMap(p => [p[0], p[1], -2]),
        });

        this.colorSchema = colorSchema;
        this.highlightColors = this.highlightModes.map(mode => {
            switch (mode) {
                case HighlightMode.CURRENT: return colorSchema['highlightAsCurrent'];
                case HighlightMode.PROVIDER: return colorSchema['highlightAsProvider'];
                case HighlightMode.CONSUMER: return colorSchema['highlightAsConsumer'];
                case FAIL_MODE_NAME: return colorSchema['fail'];
            }
        })

    }

    isMainMatrix() {
        return this.machine === null;
    }

    loadStatic() {
        // create taskMatrixVOList
        const originalTasks = this.isMainMatrix() ? this.application.tasks : this.machine.tasks;

        // this.taskMatrixVOList = [];
        // originalTasks.forEach((t, i) => {
        //     if (i % 20 === 0) {
        //         this.taskMatrixVOList.push(t.createMatrixViewObj());
        //     }
        // })
        this.taskMatrixVOList = originalTasks.map(task => task.createMatrixViewObj());

        // update transfer list
        if (this.isMainMatrix()) {
            this.transferList = this.application.abnormalTransfers;
        } else {
            const vidSet = this.machine.vidSet;
            const machine = this.machine;
            const transferList = [];
            this.application.abnormalTransfers.forEach(tran => {
                if (tran.type === 'all') {
                    if (vidSet.has(tran.srcV.vid) || tran.dst.machine === machine) {
                        transferList.push(tran);
                    }
                } else {
                    if (tran.src.machine === machine || tran.dst.machine === machine) {
                        transferList.push(tran);
                    }
                }
            });
            this.transferList = transferList;
        }
    }

    startRender() {
        this.system.create();
        this.highlightModes.forEach((mode, i) => {
            const pointsName = this.getHighlightPointsName(mode);
            this.system.addPoints(pointsName, {
                colorStyle: this.highlightColors[i],
            });
            const linesName = this.getHighlightLinesName(mode);
            this.system.addLines(linesName, {
                colorStyle: this.highlightColors[i],
                type: "segment",
            });
        });

        const transfersName = this.getHighlightTransfersName();
        this.system.addPoints(transfersName, {
            texture: 'purple-border',
            vertexColors: true,
        });

        this.system.render();

        // clear after first render
        this.system.clearPlaceHolders();

        setTimeout(() => {
            this.system.invoke(CanvasEventType.ORBIT_CHANGE, []);
        });
    }

    getHighlightPointsName(mode) {
        return mode + '-points';
    }

    getHighlightLinesName(mode) {
        return mode + '-lines';
    }

    getHighlightTransfersName() {
        return 'transfer-points';
    }

    updateSystem() {
        const duration = this.application.visDuration;
        this.xScale.domain([0, duration]);
        this.yScale.domain([0, duration]);

        this.updateMainPoints();
        this.updateHighlightPoints();
        this.updateMainTransfers();
        this.updateHighlightTransfers();
    }

    updateMainPoints() {
        if (!this.system) {
            return;
        }

        const positions = [];
        this.taskMatrixVOList.forEach(taskVO => {
            taskVO.x = this.xScale(taskVO.end);
            taskVO.y = this.yScale(taskVO.start);
            positions.push(taskVO.x, taskVO.y, 0);
        });
        // this.system.updateObjectBufferAttribute(MainObjectName.POINTS,
        //     BufferAttrName.POSITION, positions);
        this.system.updateEasingObjectBufferAttribute(MainObjectName.POINTS,
            BufferAttrName.POSITION, positions, this.application.updateRate / 1000);

        const colors = [];
        this.taskMatrixVOList.forEach(taskVO => {
            let colorStr = this.colorSchema[taskVO.vertex.type];
            if (taskVO.fail) {
                colorStr = this.colorSchema['fail'];
            }
            const color = d3.color(colorStr);
            colors.push(color.r / 255, color.g / 255, color.b / 255);
        });

        this.system.updateObjectBufferAttribute(MainObjectName.POINTS,
            BufferAttrName.COLOR, colors);
    }

    updateMainTransfers() {
        if (!this.system) {
            return;
        }

        const abTransfers = this.transferList;

        const positions = [];
        const colors = [];

        // temporary fix
        if (!this.application.maxCSize) {
            this.application.computeTransferMaxCSize();
        }

        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, this.application.maxCSize]);

        const process = (src, dst, csize) => {
            if (src.end <= dst.start) {
                return;
            }

            // position
            const x = this.xScale(dst.start);
            const y = this.yScale(src.end);
            positions.push(x, y, 0);

            // color
            const color = d3.color(colorScale(csize ?? 0));
            colors.push(color.r / 255, color.g / 255, color.b / 255);
        }

        abTransfers.forEach(tran => {
            if (tran.type === 'normal') {
                process(tran.src, tran.dst, tran.csize ?? 0);
            } else {
                tran.srcV.tasks.forEach(src => {
                    process(src, tran.dst, src.counter['OUTPUT_BYTES'] ?? 0);
                });
            }
        });

        // console.log(this, abTransfers, positions, colors);
        if (positions.length === 0) {
            this.system.updateObjectBufferAttribute(MainObjectName.TRANSFERS,
                BufferAttrName.POSITION, positions);
            this.system.updateObjectBufferAttribute(MainObjectName.TRANSFERS,
                BufferAttrName.COLOR, colors);
        } else {
            this.system.updateEasingObjectBufferAttribute(MainObjectName.TRANSFERS,
                BufferAttrName.POSITION, positions, this.application.updateRate / 1000);
            this.system.updateEasingObjectBufferAttribute(MainObjectName.TRANSFERS,
                BufferAttrName.COLOR, colors, this.application.updateRate / 1000);
        }
    }

    updateHighlightPoints() {
        if (!this.system) {
            return;
        }
        let maxDuration = -1;
        for (const [mode, taskGroup] of this.highlightTaskGroupMap.entries()) {
            const pointsPositions = [], linesPositions = [];

            taskGroup.forEach(taskVO => {
                taskVO.x = this.xScale(taskVO.end);
                taskVO.y = this.yScale(taskVO.start);
                pointsPositions.push(taskVO.x, taskVO.y, 2);

                const x0 = this.xScale(taskVO.start);
                linesPositions.push(x0, taskVO.y, 2);
                linesPositions.push(taskVO.x, taskVO.y, 2);

                maxDuration = Math.max(maxDuration, taskVO.end - taskVO.start);
            });

            const pointsName = this.getHighlightPointsName(mode),
                  linesName = this.getHighlightLinesName(mode);

            /* no animation */
            // this.system.updateObjectBufferAttribute(pointsName, BufferAttrName.POSITION, pointsPositions);
            // this.system.updateObjectBufferAttribute(linesName, BufferAttrName.POSITION, linesPositions);

            /* animation */
            if (this.highlightTaskGroupUUID === this.lastRenderedGroupUUID) {
                this.system.updateEasingObjectBufferAttribute(pointsName,
                    BufferAttrName.POSITION, pointsPositions, this.application.updateRate / 1000);
                this.system.updateEasingObjectBufferAttribute(linesName,
                    BufferAttrName.POSITION, linesPositions, this.application.updateRate / 1000);
            } else {
                this.system.updateObjectBufferAttribute(pointsName, BufferAttrName.POSITION, pointsPositions);
                this.system.updateObjectBufferAttribute(linesName, BufferAttrName.POSITION, linesPositions);
            }
        }

        this.maxSelectedDuration = maxDuration === -1 ? null : maxDuration;

        this.lastRenderedGroupUUID = this.highlightTaskGroupUUID;
    }

    updateHighlightTransfers() {
        if (!this.system) {
            return;
        }

        const positions = [];
        const colors = [];

        const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
            .domain([0, this.application.maxCSize]);

        const process = (src, dst, csize) => {
            if (src.end <= dst.start) {
                return;
            }

            // position
            const x = this.xScale(dst.start);
            const y = this.yScale(src.end);
            positions.push(x, y, 3);        // z is 3

            // color
            const color = d3.color(colorScale(csize ?? 0));
            colors.push(color.r / 255, color.g / 255, color.b / 255);
        }

        this.transferList.forEach(tran => {
            if (!tran.highlight) {
                return;
            }
            if (tran.type === 'normal') {
                process(tran.src, tran.dst, tran.csize);
            } else {
                tran.srcV.tasks.forEach(src => {
                    process(src, tran.dst, src.counter['OUTPUT_BYTES']);
                });
            }
        });

        const transferName = this.getHighlightTransfersName();

        /* no animation */
        // this.system.updateObjectBufferAttribute(transferName,
        //     BufferAttrName.POSITION, positions);
        // this.system.updateObjectBufferAttribute(transferName,
        //     BufferAttrName.COLOR, colors);

        /* animation */
        this.system.updateEasingObjectBufferAttribute(transferName,
            BufferAttrName.POSITION, positions, this.application.updateRate / 1000);
        this.system.updateObjectBufferAttribute(transferName,
            BufferAttrName.COLOR, colors);
    }

    updateHighlightGroups() {
        /* update groups */

        this.highlightModes.forEach(mode => {
            this.highlightTaskGroupMap.set(mode, []);
        });

        this.taskMatrixVOList.forEach(taskVO => {
            let taskGroup
            if (taskVO._mainObj.interact.highlightMode !== HighlightMode.NONE && taskVO.fail) {
                taskGroup = this.highlightTaskGroupMap.get(FAIL_MODE_NAME);
            } else {
                taskGroup = this.highlightTaskGroupMap.get(taskVO._mainObj.interact.highlightMode);
            }
            if (!taskGroup) {
                return;
            }
            taskGroup.push(taskVO);
        });

        this.highlightTaskGroupUUID = computeUUID();
    }

    /**
     * @returns {{y0: number, x0: number, y1: number, x1: number}}
     */
    getBoxCanvasPosition() {
        const leftTop = this.system.worldVectorToCanvasPos(new THREE.Vector3(this.xScale.range()[0], this.yScale.range()[0], 0));
        const rightBottom = this.system.worldVectorToCanvasPos(new THREE.Vector3(this.xScale.range()[1], this.yScale.range()[1], 0));
        return {
            x0: leftTop.x,
            y0: leftTop.y,
            x1: rightBottom.x,
            y1: rightBottom.y,
        }
    }

    getRefLineCanvasPosition() {
        if (this.maxSelectedDuration === null) {
            return null;
        }

        const wx0 = this.xScale(this.maxSelectedDuration);
        const wy0 = this.yScale.range()[0];
        const leftTop = this.system.worldVectorToCanvasPos(new THREE.Vector3(wx0, wy0, 0));

        const wx1 = this.xScale.range()[1];
        const wy1 = this.yScale(this.application.visDuration - this.maxSelectedDuration);
        const rightBottom = this.system.worldVectorToCanvasPos(new THREE.Vector3(wx1, wy1, 0));

        return {
            x0: leftTop.x,
            y0: leftTop.y,
            x1: rightBottom.x,
            y1: rightBottom.y,
        }
    }
}
