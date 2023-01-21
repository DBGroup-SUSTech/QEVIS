<template>
    <div class="TaskMatrixContainer" style="position: relative">
        <div style="height: 100%; width: 100%" class="matrixContainer" @click="click"></div>
        <svg style="height: 100%; width: 100%; left:0; top:0; position: absolute; pointer-events: none">
            <rect width="100%" height="100%" fill="none" fill-opacity="0.1" stroke-dasharray="5,1" stroke="grey"></rect>
            <line :x1="leftTop.x" :y1="leftTop.y"
                  :x2="rightBottom.x" :y2="rightBottom.y"
                  stroke="black" stroke-width="0.5" stroke-dasharray="5"
            ></line>
            <line v-if="refLineLayout"
                  :x1="refLineLayout.x0" :y1="refLineLayout.y0"
                  :x2="refLineLayout.x1" :y2="refLineLayout.y1"
                  stroke="black" stroke-width="0.5" stroke-dasharray="5"
            ></line>
<!--            <g>-->
<!--                <g v-if="renderingSelectedTasks.length == 1" class="renderingSelectedTasks">-->
<!--                    <g v-for="taskConfig in renderingSelectedTasks" :key="taskConfig.task.task_id">-->
<!--                        <circle fill="white" r=4-->
<!--                                fill-opacity="0.2" stroke="purple"-->
<!--                                :cx="taskConfig.x" :cy="taskConfig.y"></circle>-->
<!--                        <line :x1="taskConfig.sx" :y1="taskConfig.sy"-->
<!--                              :x2="taskConfig.x" :y2="taskConfig.y"-->
<!--                              stroke="purple" stroke-width="0.5" stroke-dasharray="2"-->
<!--                        ></line>-->
<!--                        <line v-if="renderingSelectedTasks.length == 1"-->
<!--                              :x1="taskConfig.x - size" :y1="taskConfig.y - size"-->
<!--                              :x2="taskConfig.x + size" :y2="taskConfig.y + size"-->
<!--                              stroke="purple" stroke-width="0.5" stroke-dasharray="5"-->
<!--                        ></line>-->
<!--                    </g>-->
<!--                </g>-->
<!--                <g v-if="true" class="renderingSelectedDeps">-->
<!--                    <g v-for="(depConfig, i) in renderingSelectedDeps" :key="i">-->
<!--                        <circle fill="white" r=5 fill-opacity="0.2" stroke="purple"-->
<!--                                :cx="depConfig.x" :cy="depConfig.y"></circle>-->
<!--                        <line :x1="depConfig.sx" :y1="depConfig.sy"-->
<!--                              :x2="depConfig.x" :y2="depConfig.y"-->
<!--                              stroke="black" stroke-width="0.5" stroke-dasharray="2"-->
<!--                        ></line>-->

<!--                        <line v-if="renderingSelectedDeps.length == 1"-->
<!--                              :x1="depConfig.x - size" :y1="depConfig.y - size"-->
<!--                              :x2="depConfig.x + size" :y2="depConfig.y + size"-->
<!--                              stroke="black" stroke-width="0.5" stroke-dasharray="5"-->
<!--                        ></line>-->
<!--                    </g>-->
<!--                </g>-->

<!--                <g v-if="true" class="renderingSrcAffectedTasks">-->
<!--                    <g v-for="taskConfig in renderingSrcAffectedTasks" :key="taskConfig.task.task_id">-->
<!--                        <circle fill="red" r=3-->
<!--                                fill-opacity="0.2" stroke="red"-->
<!--                                :cx="taskConfig.x" :cy="taskConfig.y"></circle>-->
<!--                    </g>-->
<!--                </g >-->
<!--                <g v-if="true" class="renderingDstAffectedTasks">-->
<!--                    <g v-for="taskConfig in renderingDstAffectedTasks" :key="taskConfig.task.task_id">-->
<!--                        <circle fill="blue" r=3-->
<!--                                fill-opacity="0.2" stroke="blue"-->
<!--                                :cx="taskConfig.x" :cy="taskConfig.y"></circle>-->
<!--                    </g>-->
<!--                </g>-->

<!--                <g v-if="false && renderingSrcAbnormalDeps && (renderingSrcAbnormalDeps.length == 1)" class="renderingSrcAbnormalDeps">-->
<!--                    <g v-for="(depConfig, i) in renderingSrcAbnormalDeps" :key="i">-->
<!--                        <circle fill="white" r=3 fill-opacity="0.1" stroke="red"-->
<!--                                :cx="depConfig.x" :cy="depConfig.y"></circle>-->
<!--                    </g>-->
<!--                </g>-->
<!--                <g v-if="false && renderingDstAbnormalDeps && (renderingSrcAbnormalDeps.length == 1)" class="renderingDstAbnormalDeps">-->
<!--                    <g v-for="(depConfig, i) in renderingDstAbnormalDeps" :key="i">-->
<!--                        <circle fill="white" r=3 fill-opacity="0.1" stroke="blue"-->
<!--                                :cx="depConfig.x" :cy="depConfig.y"></circle>-->
<!--                    </g>-->
<!--                </g>-->
<!--            </g>-->
        </svg>

    </div>
</template>

<script>
    /* eslint-disable */
import {mapState} from "vuex";
import * as d3 from "d3";
    import {TaskMatrixModel} from "@/utils/entities/TaskMatrixModel";
    import {CanvasEventType} from "@/utils/entities/TaskMatrixSystem";
    import {LayoutConfig} from "@/utils/const/LayoutConfig";
    import * as THREE from 'three';
    import {HighlightMode} from "@/utils/const/HightlightMode";

export default {
    name: "TaskMatrix",
    props: {
        /** @type {TaskMatrixModel} */
        taskMatrixModel: TaskMatrixModel,
    },
    data() {
        return {
            transferQueryTimeoutId: null,
            timeoutMilliSec: 50,
            intersectTask: null,
            taskClicked: false,
            refLineLayout: null,

            // ------------

            // radio:'zoom',
            ps: undefined,

            gap: 3,
            size: 0,
            containerHeight: 0,
            containerWidth: 0,
            timeSelectRegion: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 0
            },
            xScale: undefined,
            selectTaskCount: "",
            taskCount: "",
            nOInter: 0,
            expandRate: 3,
            yScale: undefined,
            yUScale: undefined,
            yLScale: undefined,
            extendTaskList: [],
            extendBarHeight: 5,
            initBarHeight: 5,
            extendRegionHeight: 0,
            extendRegionY: 0,
            extendTimeBoundary: 0,

            dependencyRectSize: 8,

            upperHeight: 0,
            upperRight: 0,
            downHeight: 0,
            lowerLeft: 0,
            contourData: undefined,

            context: undefined,

            delayCntMatrix: null,

            // fetchGlyphs: [],
            transformK: 1,

            provideMap: null,
            consumeMap: null,

            maxCSizeShown: 0,
            dependencyColorScale: null,

            //  lines
            leftTop: {x: 0, y: 0},
            rightBottom: {x: 0, y: 0},

            xTimeScale: undefined,
            yTimeScale: undefined,
            selectedTask: undefined
        }
    },

    components: {},
    mounted() {
        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        let size = Math.min(this.$el.clientWidth, this.$el.clientHeight) - (2 * this.gap);

        this.rightBottom.x = size;
        this.rightBottom.y = size;
        this.size = size;

        // this.$store.commit('simulation/updateTaskScale', {
        //     'width': this.size,
        //     'height': this.size,
        //     'size': this.size,
        //     'upperHeight': this.countHeight,
        // })
        // this.createLegends()
        //simulation finish
        // if (this.finishSimulation) {
        //     this.render()
        // }
        // if (this.overviewMatrix){
        //     this.render()
        // }
        // if (this.isMachine !==undefined && this.isMachine){
        //   this.render()
        // }
        this.$nextTick(() => {
            this.init();
        });
    },
    methods: {
        init() {
            let containerSel = d3.select(this.$el).select('.matrixContainer');
            containerSel.selectAll('canvas').remove();
            this.taskMatrixModel.init(containerSel.node(), LayoutConfig.padding, this.colorSchema);
            this.taskMatrixModel.startRender();

            const that = this;
            this.taskMatrixModel.system.addEvents(CanvasEventType.ENTER_OBJECT, function() {
                const task = that.taskMatrixModel.taskMatrixVOList[this.intersectIdx];
                // console.log(this.intersects[0], that.taskMatrixModel.taskMatrixVOList, task);
                that.taskMouseEnter(task);
            });
            this.taskMatrixModel.system.addEvents(CanvasEventType.LEAVE_OBJECT, function() {
                const task = that.taskMatrixModel.taskMatrixVOList[this.intersectIdx];
                // console.log(this.intersects[0], that.taskMatrixModel.taskMatrixVOList, task);
                that.taskMouseLeave(task);
            });

            this.taskMatrixModel.system.addEvents(CanvasEventType.ORBIT_CHANGE, function() {
                that.updateBoxLine();
            });

            this.render();
        },
        click() {
            if (this.intersectTask) {
                this.$store.commit('comparison/changeSelectStatusInTaskList', {
                    app: this.app,
                    task: this.intersectTask._mainObj,
                    selected: true,
                });
                this.taskClicked = true;
                console.log('click', this.intersectTask)
            }
        },
        updateBoxLine() {
            const {x0, y0, x1, y1} = this.taskMatrixModel.getBoxCanvasPosition()
            this.leftTop = {x: x0, y: y0};
            this.rightBottom = {x: x1, y: y1};
        },
        updateRefLine() {
            this.refLineLayout = this.taskMatrixModel.getRefLineCanvasPosition();
        },
        createLegends() {
            const rowHeight = this.isMachine ? 13 : 15
            const rectSize = this.isMachine ? 8 : 10
            const xOffset = this.containerWidth - (this.isMachine ? 90 : 100)
            const paneWidth = (this.isMachine ? 90 : 100) * 0.9

            let legends = ['Map', 'Reducer']
            let container = d3.select(this.$el).select(".legendContainer")
                .attr('transform', "translate(" + [xOffset, rowHeight * 0.8] + ')')

            container.append('rect').attr('fill', 'url(#dependency-color-gradient)')
                .attr('width', rectSize * 3).attr('height', rectSize)
                .attr('transform', "translate(" + [paneWidth - rectSize * 3, 0] + ')')
                .attr('stroke', 'grey')
                .attr('stroke-width', '1')

            container.append('text')
                .attr('transform', "translate(" + [paneWidth - rectSize * 3, 0] + ')')
                .style('text-anchor', 'end')
                .attr('dx', this.isMachine ? -3 : -5)
                .attr('dy', this.isMachine ? 8 : 10)
                .style('font-size', this.isMachine ? '12px' : '15px')
                .text('Data size')

            let textContainers = container.selectAll('.textContainer')
                .data(legends).enter().append('g').attr('class', 'textContainer')
                .attr('transform', (d, i) => "translate(" + [paneWidth - rectSize, rowHeight * (i + 1)] + ')')
            textContainers.append('rect').attr('width', rectSize).attr('height', rectSize)
                .attr('fill', d => {
                    const color = d3.color(this.colorSchema[d])
                    color.opacity = 0.5
                    return color.toString()
                })
                .attr('stroke', 'grey')
                .attr('stroke-width', '1');

            textContainers.append('text')
                .text(d => d)
                .attr('x', -5)
                .attr('y', this.isMachine ? 8 : 10)
                .style('text-anchor', 'end')
                .style('font-size', this.isMachine ? '12px' : '15px')

        },
        taskClick(task) {
            // task.listCopy.vertex.config.outerSelect = !task.listCopy.vertex.config.outerSelect
            // task.listCopy.machine.config.outerSelect = !task.listCopy.machine.config.outerSelect
            // task.listCopy.config.outerSelect = !task.listCopy.config.outerSelect
            // task.listCopy.vertex.extend = true
            // if (task.listCopy.vertex.extend && task.listCopy.vertex.values != undefined) {
            //     task.listCopy.vertex.config.height = d3.sum(task.listCopy.vertex.values, d => d.config.height) + task.listCopy.vertex.config.unitHeight
            // } else {
            //     task.listCopy.vertex.config.height = +task.listCopy.vertex.config.unitHeight
            // }
            // task.listCopy.machine.extend = true
            // if (task.listCopy.machine.extend && task.listCopy.machine.values != undefined) {
            //     task.listCopy.machine.config.height = d3.sum(task.listCopy.machine.values, d => d.config.height) + task.listCopy.machine.config.unitHeight
            // } else {
            //     task.listCopy.machine.config.height = +task.listCopy.machine.config.unitHeight
            // }
        },
        getSrcTasks(task_id) {
            let srcTaskMap = this.app.depTaskMaps.srcTaskMap[task_id]
            if (srcTaskMap) {
                return Object.values(srcTaskMap)
            } else {
                return srcTaskMap
            }
        },
        getDstTasks(task_id) {
            let _map = this.app.depTaskMaps.dstTaskMap[task_id]
            if (_map) {
                return Object.values(_map)
            } else {
                return _map
            }
        },
        getSrcDeps(task_id) {
            let _map = this.app.depTaskMaps.srcDepMap[task_id]
            if (_map) {
                return Object.values(_map)
            } else {
                return _map
            }
        },
        getDstDeps(task_id) {
            let _map = this.app.depTaskMaps.dstDepMap[task_id]
            if (_map) {
                return Object.values(_map)
            } else {
                return _map
            }
        },
        taskMouseEnter(task) {
            if (!task) {
                return;
            }
            this.$store.commit('comparison/changeHighlightTask', {
                app: this.app,
                task: task._mainObj,
                toHighlight: true,
            });
            this.intersectTask = task;

            // this.awaitTransferDataThen(task.tid, () => {
            //     const {srcTasks, dstTasks} = this.app.transferCache.getTransferTasks(task.tid);
            //     this.$store.commit('comparison/changeHighlightTasks', {
            //         app: this.app,
            //         tasks: srcTasks,
            //         highlightMode: HighlightMode.PROVIDER,
            //     });
            //     this.$store.commit('comparison/changeHighlightTasks', {
            //         app: this.app,
            //         tasks: dstTasks,
            //         highlightMode: HighlightMode.CONSUMER,
            //     });
            // })

            // task.layout.selectCurrent = true
            // task.listCopy.vertex.config.outerSelect = true
            // task.listCopy.machine.config.outerSelect = true
            // task.listCopy.config.outerSelect = true
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: [task.vec_name],
            //     type: 'selectCurrent',
            //     value: true,
            // })
            // const providers = this.getSrcTasks(task.task_id)
            // const consumers = this.getDstTasks(task.task_id)
            // if (providers) {
            //     providers.forEach(p => {
            //         p.layout.selectAsProvider = true
            //     })
            //
            //     const vertexSet = new Set()
            //     providers.forEach(t => vertexSet.add(t.vec_name))
            //     this.$store.commit('comparison/changeHighlightByTask', {
            //         app: this.app,
            //         vertices: Array.from(vertexSet),
            //         type: 'selectAsProvider',
            //         value: true,
            //     })
            // }
            // if (consumers) {
            //     consumers.forEach(c => c.layout.selectAsConsumer = true)
            //     const vertexSet = new Set()
            //     consumers.forEach(t => vertexSet.add(t.vec_name))
            //     this.$store.commit('comparison/changeHighlightByTask', {
            //         app: this.app,
            //         vertices: Array.from(vertexSet),
            //         type: 'selectAsConsumer',
            //         value: true,
            //     })
            // }
            // // set ref line
            // this.app.matrixRefDuration = task.end_time - task.start_time
            //
            // let srcDeps = this.getSrcDeps(task.task_id)
            // let dstDeps = this.getDstDeps(task.task_id)
            //
            // // srcAbnormalDeps
            // this.app.interactiveModule.srcAffectedDeps = srcDeps;
            // this.app.interactiveModule.dstAffectedDeps = dstDeps;
            //
            // const bcRect = this.$el.getBoundingClientRect();
            // const counter = this.counters[task.task_id];
            // this.$store.commit('comparison/changeTaskTooltipData', {
            //     show: true,
            //     layout: {
            //         x: bcRect.x - 310,
            //         y: bcRect.y,
            //         width: 300,
            //     },
            //     data: counter,
            //     step_info: task.step_info,
            // });

            // ------------------------------------------------test TODO: refactor
            // let colors = []
            // let vertices = []
            // if(srcDeps){
            //     srcDeps.forEach(dep => {
            //         vertices.push(this.xTimeScale(dep.dstTask.start_time), this.yTimeScale(dep.srcTask.end_time), 0)
            //         colors.push(255 / 255, 0 / 255, 0 / 255)
            //     })
            //     this.ps.addSrcDeps(vertices, colors)
            // }
            //
            //
            // colors = []
            // vertices = []
            // if(dstDeps){
            //     dstDeps.forEach(dep => {
            //         vertices.push(this.xTimeScale(dep.dstTask.start_time), this.yTimeScale(dep.srcTask.end_time), 0)
            //         colors.push(0 / 255, 0 / 255, 255 / 255)
            //     })
            //     this.ps.addDstDeps(vertices, colors)
            // }

        },
        taskMouseLeave(task) {
            if (!task) {
                return;
            }
            this.$store.commit('comparison/changeHighlightTask', {
                app: this.app,
                task: task._mainObj,
                toHighlight: false,
            });
            if (this.taskClicked) {
                this.taskClicked = false;
                this.$store.commit('comparison/changeSelectStatusInTaskList', {
                    app: this.app,
                    task: task._mainObj,
                    selected: false,
                });
            }
            this.intersectTask = null;

            // if (this.transferQueryTimeoutId) {
            //     clearTimeout(this.transferQueryTimeoutId);
            //     this.transferQueryTimeoutId = null;
            // }
            // if (this.app.transferCache.has(task.tid)) {
            //     // otherwise, they are never highlight
            //     const {srcTasks, dstTasks} = this.app.transferCache.getTransferTasks(task.tid);
            //     this.$store.commit('comparison/changeHighlightTasks', {
            //         app: this.app,
            //         tasks: srcTasks,
            //         highlightMode: HighlightMode.NONE,
            //     });
            //     this.$store.commit('comparison/changeHighlightTasks', {
            //         app: this.app,
            //         tasks: dstTasks,
            //         highlightMode: HighlightMode.NONE,
            //     });
            // }

            // task.layout.selectCurrent = false
            // task.listCopy.vertex.config.outerSelect = false
            // task.listCopy.machine.config.outerSelect = false
            // task.listCopy.config.outerSelect = false
            // this.$store.commit('comparison/changeHighlightByTask', {
            //     app: this.app,
            //     vertices: [task.vec_name],
            //     type: 'selectCurrent',
            //     value: false,
            // })
            // const providers = this.getSrcTasks(task.task_id)
            // const consumers = this.getDstTasks(task.task_id)
            // if (providers) {
            //     providers.forEach(p => {
            //         p.layout.selectAsProvider = false
            //     })
            //     // also highlight vertex
            //     const vertexSet = new Set()
            //     providers.forEach(t => vertexSet.add(t.vec_name))
            //     this.$store.commit('comparison/changeHighlightByTask', {
            //         app: this.app,
            //         vertices: Array.from(vertexSet),
            //         type: 'selectAsProvider',
            //         value: false,
            //     })
            // }
            // if (consumers) {
            //     consumers.forEach(c => c.layout.selectAsConsumer = false)
            //     const vertexSet = new Set()
            //     consumers.forEach(t => vertexSet.add(t.vec_name))
            //     this.$store.commit('comparison/changeHighlightByTask', {
            //         app: this.app,
            //         vertices: Array.from(vertexSet),
            //         type: 'selectAsConsumer',
            //         value: false,
            //     })
            // }
            // // remove ref line
            // this.app.matrixRefDuration = null
            // this.app.interactiveModule.srcAffectedDeps = []
            // this.app.interactiveModule.dstAffectedDeps = []
            //
            // this.$store.commit('comparison/changeTaskTooltipData', {
            //     show: false,
            // });
        },
        awaitTransferDataThen(tid, callback) {
            const cache = this.app.transferCache;
            if (cache.has(tid)) {
                callback();
            } else {
                if (this.transferQueryTimeoutId) {
                    clearTimeout(this.transferQueryTimeoutId);
                }
                this.transferQueryTimeoutId = setTimeout(() => {
                    this.$store.dispatch('comparison/getTransfer', {
                        aid: this.app.aid,
                        tid: tid,
                    }).then(() => {
                        callback();
                    });
                    clearTimeout(this.transferQueryTimeoutId);
                    this.transferQueryTimeoutId = null;
                }, this.timeoutMilliSec);
            }
        },

        render() {
            this.taskMatrixModel.updateSystem();
            // this.ps.on('mouseChange', () => {
            //     // update 中轴线
            //     let leftTop = this.ps.deteremineScreenCoordinate(xTimeScale(startTime), yTimeScale(startTime), 0);
            //     let rightBottom = this.ps.deteremineScreenCoordinate(xTimeScale(endTime), yTimeScale(endTime), 0)
            //     let rx = leftTop.x - rightBottom.x
            //     let ry = leftTop.y - rightBottom.y
            //     leftTop.x -= rx * 100
            //     leftTop.y -= ry * 100
            //     rightBottom.x += rx * 100
            //     rightBottom.y += ry * 100
            //     this.leftTop = leftTop
            //     this.rightBottom = rightBottom
            // })
            //
            // this.ps.on('selectDetect', (i, vertex) => {
            //     if (i === undefined && vertex === undefined) {
            //         this.interactiveModule.selectedTasks = []
            //         this.interactiveModule.selectedDeps = []
            //         this.interactiveModule.srcAffectedTasks = []
            //         this.interactiveModule.dstAffectedTasks = []
            //         this.ps.removeSrcVertices()
            //         this.ps.removeDstVertices()
            //         if (this.selectedTask !== undefined) {
            //             this.taskMouseLeave(this.selectedTask)
            //         }
            //         this.selectedTask = undefined
            //     } else if (i < this.taskList.length) {
            //         if (this.selectedTask != undefined) {
            //             this.taskMouseLeave(this.selectedTask)
            //             this.selectedTask = undefined
            //             this.ps.removeSrcVertices()
            //             this.ps.removeDstVertices()
            //         }
            //         this.selectedTask = this.taskList[i]
            //         this.interactiveModule.selectedTasks = [this.taskList[i]]
            //         this.taskMouseEnter(this.taskList[i])
            //         let taskId = this.taskList[i].task_id
            //         if (this.app.depTaskMaps.srcTaskMap[taskId]) {
            //             let srcTaskMap = this.app.depTaskMaps.srcTaskMap[taskId]
            //             this.interactiveModule.srcAffectedTasks = Object.values(srcTaskMap)
            //
            //             // ---------------- new rendering
            //             let colors = []
            //             let vertices = []
            //             this.interactiveModule.srcAffectedTasks.forEach(task => {
            //                 vertices.push(xTimeScale(task.end_time), yTimeScale(task.start_time), 0)
            //                 colors.push(255 / 255, 0 / 255, 0 / 255)
            //             })
            //
            //
            //             this.ps.addSrcVertices(vertices, colors)
            //
            //             // this.srcAffectedDeps.forEach(dep){
            //             //     vertices.push(xTimeScale(task.end_time), yTimeScale(task.start_time), 0)
            //             //     colors.push(255 / 255, 0 / 255, 0 / 255)
            //             // }
            //         }
            //         if (this.app.depTaskMaps.dstTaskMap[taskId] != undefined) {
            //             let dstTaskMap = this.app.depTaskMaps.dstTaskMap[taskId]
            //             this.interactiveModule.dstAffectedTasks = []
            //             Object.values(dstTaskMap).forEach(task => {
            //                 this.interactiveModule.dstAffectedTasks.push(task)
            //             })
            //
            //             // ---------------- new rendering
            //             let colors = []
            //             let vertices = []
            //             this.interactiveModule.dstAffectedTasks.forEach(task => {
            //                 vertices.push(xTimeScale(task.end_time), yTimeScale(task.start_time), 0)
            //                 colors.push(0 / 255, 0 / 255, 255 / 255)
            //             })
            //             this.ps.addDstVertices(vertices, colors)
            //         }
            //     } else {
            //         const dep = this.abnormalDeps[i - this.taskList.length]
            //         this.interactiveModule.selectedDeps = [dep]
            //         this.interactiveModule.srcAffectedTasks = [dep.srcTask]
            //         this.interactiveModule.dstAffectedTasks = [dep.dstTask]
            //
            //         // let colors = []
            //         // let vertices = []
            //         // this.interactiveModule.dstAffectedTasks.forEach(task => {
            //         //     vertices.push(xTimeScale(task.end_time), yTimeScale(task.start_time), 0)
            //         //     colors.push(0 / 255, 0 / 255, 255 / 255)
            //         // })
            //         // this.ps.addDstVertices(vertices, colors)
            //
            //     }
            // })
            // canvas-------------------------------Done
        },
    },
    watch: {
        matrixSign() {
            this.render()
        },
        taskMatrixModel() {
            this.init();
        },
        maxSelectedDuration() {
            this.updateRefLine();
        },
        // selectedTasks(tasks){
        //     if (this.ps !== undefined)
        //
        //     {
        //         if(tasks == undefined || tasks.length == 0){
        //             this.ps.removeSelectedVertices()
        //         }else {
        //             let colors = []
        //             let vertices = []
        //             tasks.forEach(task => {
        //                 vertices.push(this.xTimeScale(task.end_time), this.yTimeScale(task.start_time), 0)
        //                 colors.push(129 / 255, 15 / 255, 124 / 255)
        //             })
        //             this.ps.addSelectedVertices(vertices, colors)
        //         }}
        // },
        // srcAffectedDeps(srcDeps){
        //     if(srcDeps == undefined || srcDeps.length == 0){
        //         this.ps.removeSrcDeps()
        //     }else{
        //         let colors = []
        //         let vertices = []
        //         srcDeps.forEach(dep => {
        //             vertices.push(this.xTimeScale(dep.dstTask.start_time), this.yTimeScale(dep.srcTask.end_time), 0)
        //             colors.push(255 / 255, 0 / 255, 0 / 255)
        //         })
        //         this.ps.addSrcDeps(vertices, colors)
        //     }
        // },
        // dstAffectedDeps(dstDeps){
        //     if(dstDeps == undefined || dstDeps.length == 0){
        //         this.ps.removeDstDeps()
        //     }else {
        //         let colors = []
        //         let vertices = []
        //         dstDeps.forEach(dep => {
        //             vertices.push(this.xTimeScale(dep.dstTask.start_time), this.yTimeScale(dep.srcTask.end_time), 0)
        //             colors.push(0 / 255, 0 / 255, 255 / 255)
        //         })
        //         this.ps.addDstDeps(vertices, colors)
        //     }
        // },
        // interaction() {
        //     if (this.interaction == 'zoom') {
        //         this.svg = d3.select(this.$el);
        //         var zoom = d3.zoom()
        //             .scaleExtent([-13, 12])
        //             .on('zoom', () => {
        //                 this.svg.select('.rootContainer').attr('transform', d3.event.transform)
        //             });
        //
        //         this.svg.call(zoom);
        //     } else if (this.interaction == 'brush') {
        //         this.svg = d3.select(this.$el);
        //         this.svg.call(d3.zoom().on('zoom', null));
        //     }
        // },
        // directShown() {
        //     if (this.showDataflow) {
        //         this.drawFetch()
        //     }
        // },
        // selectionRegion: {
        //     handler(timeSelection) {
        //         if (this.xScale) {
        //             this.timeSelectRegion.x1 = this.xScale(timeSelection.minStartTime);
        //             this.timeSelectRegion.x2 = this.xScale(timeSelection.maxEndTime);
        //             this.timeSelectRegion.y1 = this.xScale(timeSelection.minStartTime);
        //             this.timeSelectRegion.y2 = this.xScale(timeSelection.maxStartTime);
        //         }
        //     },
        //     deep: true
        // }
    },
    computed: {
        ...mapState('comparison', {
            colorSchema: state => state.colorSchema,
            finishSimulation: state => state.finishSimulation,
        }),
        app() {
            return this.taskMatrixModel.application;
        },
        maxSelectedDuration() {
            return this.taskMatrixModel.maxSelectedDuration;
        },

        // ------------
        renderingSelectedTasks() {
            if (this.ps === undefined)
                return []
            let renderingData = []
            this.selectedTasks.forEach(task => {
                let position = this.ps.deteremineScreenCoordinate(this.xTimeScale(task.end_time),
                    this.yTimeScale(task.start_time), 0);
                let startPosition = this.ps.deteremineScreenCoordinate(this.xTimeScale(task.start_time),
                    this.yTimeScale(task.start_time), 0);
                let tempData = {
                    task: task,
                    x: position.x,
                    y: position.y,
                    sx: startPosition.x,
                    sy: startPosition.y
                }
                renderingData.push(tempData)
            })

            return renderingData
        },
        renderingSelectedDeps() {
            let renderingData = []
            this.selectedDeps.forEach(dep => {
                let position = this.ps.deteremineScreenCoordinate(this.xTimeScale(dep.dstTask.start_time),
                    this.yTimeScale(dep.srcTask.end_time), 0);
                let startPosition = this.ps.deteremineScreenCoordinate(this.xTimeScale(dep.dstTask.start_time),
                    this.yTimeScale(dep.dstTask.start_time), 0);
                let tempData = {
                    dep: dep,
                    x: position.x,
                    y: position.y,
                    sx: startPosition.x,
                    sy: startPosition.y
                }
                renderingData.push(tempData)
            })
            return renderingData
        },
        renderingSrcAffectedTasks() {
            let renderingData = []
            this.srcAffectedTasks.forEach(task => {
                let position = this.ps.deteremineScreenCoordinate(this.xTimeScale(task.end_time),
                    this.yTimeScale(task.start_time), 0);
                let startPosition = this.ps.deteremineScreenCoordinate(this.xTimeScale(task.start_time),
                    this.yTimeScale(task.start_time), 0);
                let tempData = {
                    task: task,
                    x: position.x,
                    y: position.y,
                    sx: startPosition.x,
                    sy: startPosition.y
                }
                renderingData.push(tempData)
            })
            return renderingData
        },
        renderingDstAffectedTasks() {
            let renderingData = []
            this.dstAffectedTasks.forEach(task => {
                let position = this.ps.deteremineScreenCoordinate(this.xTimeScale(task.end_time),
                    this.yTimeScale(task.start_time), 0);
                let startPosition = this.ps.deteremineScreenCoordinate(this.xTimeScale(task.start_time),
                    this.yTimeScale(task.start_time), 0);
                let tempData = {
                    task: task,
                    x: position.x,
                    y: position.y,
                    sx: startPosition.x,
                    sy: startPosition.y
                }
                renderingData.push(tempData)
            })
            return renderingData
        },
        renderingSrcAbnormalDeps() {
            // 'srcAbnormalDeps', 'dstAbnormalDeps'
            let renderingData = []
            if (!this.srcAffectedDeps || this.srcAffectedDeps.length ==1) {
                return []
            }
            this.srcAffectedDeps.forEach(dep => {
                let position = this.ps.deteremineScreenCoordinate(this.xTimeScale(dep.dstTask.start_time),
                    this.yTimeScale(dep.srcTask.end_time), 0);
                let startPosition = this.ps.deteremineScreenCoordinate(this.xTimeScale(dep.dstTask.start_time),
                    this.yTimeScale(dep.dstTask.start_time), 0);
                let tempData = {
                    dep: dep,
                    x: position.x,
                    y: position.y,
                    sx: startPosition.x,
                    sy: startPosition.y
                }
                renderingData.push(tempData)
            })
            return renderingData
        },
        renderingDstAbnormalDeps() {
            // 'srcAffectedDeps', 'dstAffectedDeps'
            let renderingData = []
            if (!this.dstAffectedDeps || this.dstAffectedDeps.length ==1) {
                return []
            }
            this.dstAffectedDeps.forEach(dep => {
                let position = this.ps.deteremineScreenCoordinate(this.xTimeScale(dep.dstTask.start_time),
                    this.yTimeScale(dep.srcTask.end_time), 0);
                let startPosition = this.ps.deteremineScreenCoordinate(this.xTimeScale(dep.dstTask.start_time),
                    this.yTimeScale(dep.dstTask.start_time), 0);
                let tempData = {
                    dep: dep,
                    x: position.x,
                    y: position.y,
                    sx: startPosition.x,
                    sy: startPosition.y
                }
                renderingData.push(tempData)
            })
            return renderingData
        },
        containerTransform() {
            let dx = this.gap, dy = this.gap;
            if (this.containerWidth > this.containerHeight) {
                dx += (this.containerWidth - this.size) / 2;
            } else {
                dy += 0;
            }
            return 'translate(' + [dx, dy] + ')';
        },
        matrixTransform() {
            return 'translate(' + [0, 0] + ')';
        },
        countTransform() {
            return 'translate(' + [0, this.size] + ')';
        },
        memoryTransform() {
            return 'translate(' + [0, this.size + this.countHeight] + ')';
        },
        cpuTransform() {
            return 'translate(' + [0, this.size + this.countHeight * 2] + ')';
        },
        netTransform() {
            return 'translate(' + [0, this.size + this.countHeight * 3] + ')';
        },
        diskTransform() {
            return 'translate(' + [0, this.size + this.countHeight * 4] + ')';
        },
        leftTransform() {
            return 'translate(' + [0, this.size / 8] + ')';
        },
        bottomTransform() {
            return 'translate(' + [this.size / 8, this.size - (this.size / 8)] + ')';
        },
        rightTransform() {
            return 'translate(' + [this.size - (this.size / 8), this.size / 8] + ')';
        },

        // matrixDiagMin() {
        //     return this.app.matrixDiagMin
        // },
        // matrixDiagMax() {
        //     return this.app.matrixDiagMax
        // },
        // selectionRegion() {
        //     return this.app.timeSelection
        // },
        matrixSign() {
            return this.taskMatrixModel.application.signs.matrixSign;
        },
        // maxTime() {
        //     return this.app.maxTime
        // },
        // minTime() {
        //     return this.app.minTime
        // },
        // vMaxTime() {
        //     return this.app.vMaxTime
        // },
        // metrics() {
        //     return this.app.metrics
        // },
        // taskMap() {
        //     return this.app.taskMap
        // },
        // dataFlow() {
        //     return this.app.dataFlow
        // },
        // counters() {
        //     return this.app.counters
        // },
        // maxCSize() {
        //     return this.app.maxCSize
        // },
        // fetchGlyphs(){
        //     return this.app.fetchGlyphs
        // },
        // contourFillColor() {
        //     // return d3.scaleSequential(d3.interpolateGreys)
        //     //     .domain([0, d3.max(this.contourData, d => +d.value)]);
        //     return d3.scaleSequential(d3.interpolateGreys)
        //         .domain([0, d3.max(this.contourData, d => +d.value)]);
        // },
        // loaded() {
        //     if (this.taskList.length == 0) {
        //         return false
        //     } else {
        //         return true
        //     }
        // },
        // timeSelected() {
        //     let _sum = this.selectionRegion.startTime + this.selectionRegion.endTime;
        //
        //     if (_sum > 0) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // },
        // dependencyColor0() {
        //     if (!this.dependencyColorScale) {
        //         return '#ffffff'
        //     }
        //     return this.dependencyColorScale(0)
        // },
        // dependencyColor1() {
        //     if (!this.dependencyColorScale) {
        //         return '#ffffff'
        //     }
        //     return this.dependencyColorScale(this.maxCSize)
        // },
        // matrixRefDuration() {
        //     return this.app.matrixRefDuration
        // },
        // refLineOffset() {
        //     if (!this.xScale) return 0
        //     return this.xScale(this.matrixRefDuration) - this.xScale(0)
        // }
    }
}
</script>

<style scoped>

</style>
