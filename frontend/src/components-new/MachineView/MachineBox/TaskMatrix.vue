<template>
  <div>
    <svg style="height: 100%; width: 100%;left:0; top:0">
      <defs>
        <linearGradient id="dependency-color-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" :stop-color="dependencyColor0"/>
          <stop offset="100%" :stop-color="dependencyColor1"/>
        </linearGradient>
      </defs>
      <g :transform="containerTransform" class="rootContainer">
        <g v-if="showDataflow && dependence">
          <!--                    <foreignObject :height="containerWidth" :width="containerWidth">-->
          <!--                        <canvas style="height: 100%; width: 100%;object-fit:contain;"> </canvas>-->
          <!--                    </foreignObject>-->
          <!--                    :stroke="'#2a2929'"-->
          <circle v-for="(glyph, i) in fetchGlyphs" :key="i"
                  opacity="0.5"
                  :fill="glyph.fill"
                  :stroke="'purple'"
                  :stroke-width="glyph.highlight ? 3/transformK : 0.1"
                  :cx="glyph.cx" :cy="glyph.cy" :r="3/transformK"
                  @mouseenter="fetchMouseEnter(glyph)"
                  @mouseleave="fetchMouseLeave(glyph)"
          ></circle>
        </g>

        <g v-if="loaded">
          <g class="matrix" :transform="matrixTransform">
            <rect fill="none" stroke="grey" fill-opacity="0.2"
                  :width="size" :height="size" :stroke-width="0.5 / transformK"></rect>
            <!--                        <rect class="upperRegion" stroke="grey" :width="size" stroke-width="0.5"-->
            <!--                              :height="upperHeight" fill="grey" fill-opacity="0.05"></rect>-->
            <!--                        <rect class="lowerRegion" stroke="grey" :width="size" stroke-width="0.5"-->
            <!--                              :y="size-downHeight" :height="downHeight" fill="grey" fill-opacity="0.05"></rect>-->

            <line style="stroke:grey" :style="{strokeWidth: 0.3 / transformK}"
                  :stroke-dasharray="3 / transformK"
                  v-if="matrixRefDuration"
                  :x1="0 + refLineOffset"
                  :y1="0"
                  :x2="size"
                  :y2="size - refLineOffset">
            </line>

            <TaskNode v-for="task in taskList"
                      :key="task.task_id" :xScale="xScale" :yScale="yScale"
                      :transform-k="transformK"
                      v-show="!task.selectedToExtend"
                      :task="task" :matrixDiagMin="matrixDiagMin" :matrixDiagMax="matrixDiagMax"
                      v-on:click.native="taskClick(task)"
                      v-on:mouseenter.native="taskMouseEnter(task)"
                      v-on:mouseleave.native="taskMouseLeave(task)"/>
            <!--                        <line style="stroke:grey;stroke-width:0.5" stroke-dasharray="4"-->
            <!--                              :x1="0"-->
            <!--                              :y1="0"-->
            <!--                              :x2="upperRight"-->
            <!--                              :y2="upperHeight">-->
            <!--                        </line>-->
            <!--                        <line style="stroke:grey;stroke-width:0.5" stroke-dasharray="4"-->
            <!--                              :x1="lowerLeft"-->
            <!--                              :y1="size-downHeight"-->
            <!--                              :x2="size"-->
            <!--                              :y2="size">-->
            <!--                        </line>-->
            <line style="stroke:grey" :style="{strokeWidth: 0.5 / transformK}"
                  :stroke-dasharray="4 / transformK"
                  v-if="upperHeight==0"
                  :x1="0"
                  :y1="0"
                  :x2="size"
                  :y2="size">
            </line>
            <g v-if="timeSelected == true">
              <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"
                    :x1="timeSelectRegion.x1"
                    :y1="0"
                    :x2="timeSelectRegion.x1"
                    :y2="size">
              </line>
              <line style="stroke:mediumpurple; stroke-width:1" stroke-dasharray="4"
                    :x1="timeSelectRegion.x2"
                    :y1="0"
                    :x2="timeSelectRegion.x2"
                    :y2="size">
              </line>

              <!--                        <line style="stroke:mediumpurple;stroke-width:1" stroke-dasharray="4"-->
              <!--                              :x1="0"-->
              <!--                              :y1="timeSelectRegion.y1"-->
              <!--                              :x2="size"-->
              <!--                              :y2="timeSelectRegion.y1">-->
              <!--                        </line>-->

              <!--                        <line style="stroke:mediumpurple;stroke-width:1" stroke-dasharray="4"-->
              <!--                              :x1="0"-->
              <!--                              :y1="timeSelectRegion.y2"-->
              <!--                              :x2="size"-->
              <!--                              :y2="timeSelectRegion.y2">-->
              <!--                        </line>-->
            </g>
            <g class="vertexNode">
            </g>
          </g>
          <g>


            <!--                    <g :fill="null" stroke="#FFF" stroke-width=0.1 stroke-opacity=0.3 class="contourPath"-->
            <!--                       v-if="contourData!=undefined">-->
            <!--                        <path v-for="index in Object.keys(contourData)" :key="index"-->
            <!--                              :fill="contourFillColor(contourData[index].value)" :d="geoPath(contourData[index])"></path>-->
            <!--                    </g>-->
            <!--                        <circle v-for="(flow, index) in dataFlow" :key="index" r=1 fill="red" fill-opacity="0.1"-->
            <!--                                :cx="xScale(flow.srcTask.end_time)"-->
            <!--                                :cy="xScale(flow.dstTask.start_time)"-->
            <!--                        ></circle>-->
          </g>
          <g class="extendTaskList">
            <TaskNodeExtend v-for="(task, index) in extendTaskList" :key="task.task_id"
                            :xScale="xScale" :task="task"
                            :y="index*extendBarHeight" :x="xScale(task.start_time)"
                            :width="xScale(task.end_time) - xScale(task.start_time)"
                            :barHeight="extendBarHeight"
            ></TaskNodeExtend>
          </g>
        </g>
        <g v-if="!loaded">
          <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
            No data selected
          </text>
        </g>
      </g>
      <g class="legendContainer" v-show="loaded"></g>
    </svg>
  </div>
</template>

<script>
import {mapState} from "vuex";
import TaskNode from "../ScatterChart/TaskNode";
import TaskNodeExtend from "../ScatterChart/TaskNodeExtend";
import * as d3 from "d3";
// import TweenLite from "gsap";
// import VertexNode from "@/components/ScatterView/VertexNode";

// const dLine = d3.line().x(d => d.x).y(d => d.y);
//
// const atomTaskCountLine = function (taskList, outputRange, mXScale) {
//     let usage = [];
//     let trend = [];
//     let count = 0;
//     taskList.forEach(task => {
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
//             if (trend.length == 0) {
//                 trend.push({'time': u.time, 'count': 0})
//             }
//             trend.push({'time': u.time, 'count': count})
//         }
//     })
//
//     let mTYScale = d3.scaleLinear().domain([0, d3.max(trend, u => u.count)]).range(outputRange);
//     let _render = [];
//     trend.forEach((u, i) => {
//         if (i != 0) {
//             _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
//         }
//         _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
//     })
//     return dLine(_render);
// }
export default {
  name: "TaskMatrix",
  props: ['app', 'taskList', 'id', 'ch', 'status', 'showDataflow',
    'interaction', 'directShown', 'isMachine', 'dependence'],
  data() {
    let ch = 30
    if (this.ch != undefined) {
      ch = this.ch
    }
    return {
      // radio:'zoom',
      gap: 3,
      size: 0,
      containerHeight: 0,
      containerWidth: 0,
      countHeight: ch,
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
      memLine: "",
      memArea: "",
      cpuPaths: [],
      netIOLines: [],
      diskPaths: [],
      // Extend data
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

            fetchGlyphs: [],
            transformK: 1,

            provideMap: new Map(),
            consumeMap: new Map(),
            srcId2ShownFetchGlyphs: null,
            dstId2ShownFetchGlyphs: null,

            maxCSizeShown: 0,
            dependencyColorScale: null,
        }
    },

    components: {
        TaskNode,
        TaskNodeExtend
        // VertexNode
    },
    mounted() {
        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        let size = Math.min(this.$el.clientWidth, this.$el.clientHeight) - (2 * this.gap);
        this.size = size;
        // this.countHeight = this.size - this.gap;
        this.$store.commit('simulation/updateTaskScale', {
            'width': this.size,
            'height': this.size,
            'size': this.size,
            'upperHeight': this.countHeight,
        })

    if (this.interaction == 'zoom') {
      this.svg = d3.select(this.$el);
      var zoom = d3.zoom()
          .scaleExtent([-13, 12])
          .on('zoom', () => {
            this.svg.select('.rootContainer').attr('transform', d3.event.transform)
            this.transformK = d3.event.transform.k
            // this.$nextTick(() => {
            //     this.repaint()
            // })
          });

            this.svg.call(zoom);
        }

        // this.yScale = d3.scaleLinear().domain([0, 100]).range([this.countHeight, 5]);

        this.createLegends()
    },
    methods: {
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
    geoPath(data) {
      return d3.geoPath()(data);
    },
    updateFetchMap(srcTask, dstTask) {
      let provide = this.provideMap.get(dstTask.task_id)
      if (!provide) {
        provide = []
        this.provideMap.set(dstTask.task_id, provide)
      }
      provide.push(srcTask)

      let consume = this.consumeMap.get(srcTask.task_id)
      if (!consume) {
        consume = []
        this.consumeMap.set(srcTask.task_id, consume)
      }
      consume.push(dstTask)
    },
    updateShownFetchRects(fetchGlyph) {
      const srcTask = fetchGlyph.srcTask
      let srcFetchGlyphs = this.srcId2ShownFetchGlyphs.get(srcTask.task_id)
      if (!srcFetchGlyphs) {
        srcFetchGlyphs = []
        this.srcId2ShownFetchGlyphs.set(srcTask.task_id, srcFetchGlyphs)
      }
      srcFetchGlyphs.push(fetchGlyph)

      const dstTask = fetchGlyph.dstTask
      let dstFetchGlyphs = this.dstId2ShownFetchGlyphs.get(dstTask.task_id)
      if (!dstFetchGlyphs) {
        dstFetchGlyphs = []
        this.srcId2ShownFetchGlyphs.set(dstTask.task_id, dstFetchGlyphs)
      }
      dstFetchGlyphs.push(fetchGlyph)
    },
    computeFetchGlyphs() {    // FIXME compute fetch rects, move to backend? one for all?
      this.provideMap = new Map()
      this.consumeMap = new Map()
      this.srcId2ShownFetchGlyphs = new Map()
      this.dstId2ShownFetchGlyphs = new Map()

      let maxCSize = 0
      this.dataFlow.forEach((d) => {
        if (d.label === 'NORMAL') {
          maxCSize = Math.max(maxCSize, d.csize)
        } else {
          d.srcTasks.forEach(srcTask => {
            let srcTaskCounters = this.counters[srcTask['task_id']]
            maxCSize = Math.max(maxCSize, srcTaskCounters['OUTPUT_BYTES'])
          })
        }
      })
      this.app.maxCSize = maxCSize

      const fetchGlyphs = []
      const colorScale = this.dependencyColorScale = d3.scaleSequential(d3.interpolateYlOrRd)
          .domain([0, maxCSize]);
      this.dataFlow.forEach((d) => {
        if (d.label === 'NORMAL') {
          // update map
          this.updateFetchMap(d.srcTask, d.dstTask)

          if (this.directShown === 'src' && d.srcTask['machine_id'] !== this.id
              || this.directShown === 'dst' && d.dstTask['machine_id'] !== this.id) {
            return
          }
          const xTime = d.dstTask.start_time
          const yTime = d.srcTask.end_time
          if (xTime >= yTime) {
            return
          }
          const fetchGlyph = {
            fill: colorScale(d.csize),
            cx: this.xScale(xTime),
            cy: this.yScale(yTime),
            fetch: d,
            srcTask: d.srcTask,
            dstTask: d.dstTask,
            highlight: false,
          }
          fetchGlyphs.push(fetchGlyph)
          this.updateShownFetchRects(fetchGlyph)
          this.maxCSizeShown = Math.max(this.maxCSizeShown, d.csize)
        } else {
          d.srcTasks.forEach(srcTask => {
            // update map
            this.updateFetchMap(srcTask, d.dstTask)

                        if (this.directShown === 'src' && srcTask['machine_id'] !== this.id
                            || this.directShown === 'dst' && d.dstTask['machine_id'] !== this.id) {
                            return
                        }
                        const xTime = d.dstTask.start_time
                        const yTime = srcTask.end_time
                        if (xTime >= yTime) {
                            return
                        }
                        let srcTaskCounters = this.counters[srcTask['task_id']]
                        const fetchGlyph = {
                            fill: colorScale(srcTaskCounters['OUTPUT_BYTES']),
                            cx: this.xScale(xTime),
                            cy: this.yScale(yTime),
                            fetch: d,
                            srcTask: srcTask,
                            dstTask: d.dstTask,
                            highlight: false,
                        }
                        fetchGlyphs.push(fetchGlyph)
                        this.updateShownFetchRects(fetchGlyph)
                        this.maxCSizeShown = Math.max(this.maxCSizeShown, srcTaskCounters['OUTPUT_BYTES'])
                    })
                }
            })
            this.fetchGlyphs = fetchGlyphs

            // console.log('fetchGlyphs--sdfsdf-', this.fetchGlyphs)
        },
        repaint() {
            if (this.showDataflow) {
                this.computeFetchGlyphs()
            }
        },
        drawDelayMatrix() {
            this.context.clearRect(0, 0, this.size, this.size);
            // draw delay matrix
            let colorScale = d3.scaleSequential(d3.interpolateRgb('rgba(255,208,143,0.82)', '#a92f59')).domain([1, this.delayCntMax]);
            // console.log(this.delayCntMatrix)
            let w = (this.size - 20) / 100, h = (this.size - 20) / 100
            for (let cIdx = 0, cNum = this.delayCntMatrix.length; cIdx < cNum; cIdx++) {
                let cv = this.delayCntMatrix[cIdx]
                for (let rIdx = 0, rNum = cv.length; rIdx < rNum; rIdx++) {
                    let v = cv[rIdx]
                    this.context.fillStyle = v === 0 ? 'rgba(255,255,255,0)' : colorScale(v);
                    this.context.fillRect(w * cIdx - w / 2, h * rIdx - h / 2, w, h);
                }
            }
            console.log('delay matrix redraw')
        },
        computeDelayCnt() {
            this.delayCntMax = 0
            if (this.delayCntMatrix == null) {  // init
                this.delayCntMatrix = []
                for (let i = 0; i < 100; i++) {
                    let col = []
                    for (let j = 0; j < 100; j++) {
                        col.push(0)
                    }
                    this.delayCntMatrix.push(col)
                }
            } else {        // clear
                for (let i = 0, iLen = this.delayCntMatrix.length; i < iLen; i++) {
                    let col = this.delayCntMatrix[i]
                    for (let j = 0, jLen = col.length; j < jLen; j++) {
                        col[j] = 0
                    }
                }
            }
            let pixelRange = this.size - 20
            let computedMap = {}        // vtx name -> cIdx of tasks
            this.dataFlow.forEach(d => {
                if (d.label === 'ALL') {
                    let yPos = this.yScale(d.dstTask.start_time)
                    let rIdx = Math.floor(yPos * 100 / pixelRange)
                    let taskCIdxList = computedMap[d.srcVtxName]
                    if (taskCIdxList == undefined) {
                        taskCIdxList = []
                        d.srcTasks.forEach(task => {
                            let xPos = this.xScale(task.end_time)
                            let cIdx = Math.floor(xPos * 100 / pixelRange)
                            taskCIdxList.push(cIdx)
                        })
                        computedMap[d.srcVtxName] = taskCIdxList
                    }
                    for (let i = 0, iLen = d.srcTasks.length; i < iLen; i++) {
                        let cIdx = taskCIdxList[i]
                        // console.log(cIdx, rIdx)
                        this.delayCntMatrix[cIdx][rIdx] += 1
                        this.delayCntMax = Math.max(this.delayCntMatrix[cIdx][rIdx], this.delayCntMax)
                    }
                } else if (d.label === 'NORMAL') {
                    let xPos = this.xScale(d.srcTask.end_time),
                        yPos = this.yScale(d.dstTask.start_time)
                    let cIdx = Math.floor(xPos * 100 / pixelRange)
                    let rIdx = Math.floor(yPos * 100 / pixelRange)
                    this.delayCntMatrix[cIdx][rIdx] += 1
                    this.delayCntMax = Math.max(this.delayCntMatrix[cIdx][rIdx], this.delayCntMax)
                } else {
                    console.log('Unsupported fetch label')
                }
            })
            console.log('delay matrix recompute')
            // console.log('computeDelayCnt', this.dataFlow.length)
        },
        taskClick(task){
            task.listCopy.vertex.config.outerSelect = !task.listCopy.vertex.config.outerSelect
            task.listCopy.machine.config.outerSelect = !task.listCopy.machine.config.outerSelect
            task.listCopy.config.outerSelect = !task.listCopy.config.outerSelect
            task.listCopy.vertex.extend = true
            if(task.listCopy.vertex.extend && task.listCopy.vertex.values != undefined){
                task.listCopy.vertex.config.height = d3.sum(task.listCopy.vertex.values, d=>d.config.height) + task.listCopy.vertex.config.unitHeight
            }else {
                task.listCopy.vertex.config.height = + task.listCopy.vertex.config.unitHeight
            }
            task.listCopy.machine.extend = true
            if(task.listCopy.machine.extend && task.listCopy.machine.values != undefined){
                task.listCopy.machine.config.height = d3.sum(task.listCopy.machine.values, d=>d.config.height) + task.listCopy.machine.config.unitHeight
            }else {
                task.listCopy.machine.config.height = + task.listCopy.machine.config.unitHeight
            }
            console.log('click', task)
        },
        taskMouseEnter(task) {
            // console.log('1111111111111')
            task.layout.selectCurrent = true
            task.listCopy.vertex.config.outerSelect = true
            task.listCopy.machine.config.outerSelect = true
            task.listCopy.config.outerSelect = true
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: [task.vec_name],
                type: 'selectCurrent',
                value: true,
            })
            const providers = this.provideMap.get(task.task_id)
            const consumers = this.consumeMap.get(task.task_id)
            // console.log('task id ----------------', task.task_id)
            // console.log('provider ---------------', providers)
            // console.log('consumers --------------', consumers)
            if (providers) {
                providers.forEach(p => {
                    p.layout.selectAsProvider = true
                })
                // also highlight vertex
                const vertexSet = new Set()
                providers.forEach(t => vertexSet.add(t.vec_name))
                this.$store.commit('comparison/changeHighlightByTask', {
                    app: this.app,
                    vertices: Array.from(vertexSet),
                    type: 'selectAsProvider',
                    value: true,
                })
            }
            if (consumers) {
                consumers.forEach(c => c.layout.selectAsConsumer = true)
                const vertexSet = new Set()
                consumers.forEach(t => vertexSet.add(t.vec_name))
                this.$store.commit('comparison/changeHighlightByTask', {
                    app: this.app,
                    vertices: Array.from(vertexSet),
                    type: 'selectAsConsumer',
                    value: true,
                })
            }
            // set ref line
            this.app.matrixRefDuration = task.end_time - task.start_time
            // update dependency
            this.srcId2ShownFetchGlyphs.get(task.task_id)?.forEach(glyph => {
                glyph.highlight = true
            })
            this.dstId2ShownFetchGlyphs.get(task.task_id)?.forEach(glyph => {
                glyph.highlight = true
            })
        },
        taskMouseLeave(task) {
            task.layout.selectCurrent = false
            task.listCopy.vertex.config.outerSelect = false
            task.listCopy.machine.config.outerSelect = false
            task.listCopy.config.outerSelect = false
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: [task.vec_name],
                type: 'selectCurrent',
                value: false,
            })
            const providers = this.provideMap.get(task.task_id)
            const consumers = this.consumeMap.get(task.task_id)
            if (providers) {
                providers.forEach(p => {
                    p.layout.selectAsProvider = false
                })
                // also highlight vertex
                const vertexSet = new Set()
                providers.forEach(t => vertexSet.add(t.vec_name))
                this.$store.commit('comparison/changeHighlightByTask', {
                    app: this.app,
                    vertices: Array.from(vertexSet),
                    type: 'selectAsProvider',
                    value: false,
                })
            }
            if (consumers) {
                consumers.forEach(c => c.layout.selectAsConsumer = false)
                const vertexSet = new Set()
                consumers.forEach(t => vertexSet.add(t.vec_name))
                this.$store.commit('comparison/changeHighlightByTask', {
                    app: this.app,
                    vertices: Array.from(vertexSet),
                    type: 'selectAsConsumer',
                    value: false,
                })
            }
            // remove ref line
            this.app.matrixRefDuration = null
            // update dependency
            this.srcId2ShownFetchGlyphs.get(task.task_id)?.forEach(glyph => {
                glyph.highlight = false
            })
            this.dstId2ShownFetchGlyphs.get(task.task_id)?.forEach(glyph => {
                glyph.highlight = false
            })
        },
        fetchMouseEnter(fetchRect) {
            fetchRect.highlight = true
            fetchRect.srcTask.layout.selectAsProvider = true
            fetchRect.dstTask.layout.selectAsConsumer = true
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: [fetchRect.srcTask.vec_name],
                type: 'selectAsProvider',
                value: true,
            })
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: [fetchRect.dstTask.vec_name],
                type: 'selectAsConsumer',
                value: true,
            })
        },
        fetchMouseLeave(fetchRect) {
            fetchRect.highlight = false
            fetchRect.srcTask.layout.selectAsProvider = false
            fetchRect.dstTask.layout.selectAsConsumer = false
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: [fetchRect.srcTask.vec_name],
                type: 'selectAsProvider',
                value: false,
            })
            this.$store.commit('comparison/changeHighlightByTask', {
                app: this.app,
                vertices: [fetchRect.dstTask.vec_name],
                type: 'selectAsConsumer',
                value: false,
            })
        },
    },

    watch: {
        renderSign() {
            if (this.xScale == undefined) {
                this.xScale = d3.scaleLinear().domain([this.minTime, this.vMaxTime]).range([0, this.size - 20]);
            }
            if (this.xScale != undefined) {
                this.xScale = d3.scaleLinear().domain([this.minTime, this.vMaxTime]).range([0, this.size - 20]);
            }
            // this.taskCount = atomTaskCountLine(this.taskList, [this.countHeight, 0], this.xScale);
            let tasks = [];

            let smallerNum = 0, largerNum = 0;
            let pos = 'before';
            this.taskList.forEach((task, index) => {
                //TODO will be removed!
                if (task.selectedToExtend == true) {
                    pos = 'after'
                    task.extendLayuout = {
                        "x": this.xScale(task.start_time),
                        "y": index * 5,
                        "width": this.xScale(task.end_time) - this.xScale(task.start_time)
                    };
                    tasks.push(task);
                } else {
                    if (pos == 'before') {
                        smallerNum += 1;
                    } else if (pos == 'after') {
                        largerNum += 1;
                    }
                }
            })
            if (tasks.length == 0) {
                this.yScale = this.xScale;
                this.upperHeight = 0;
                this.lowerLeft = 0;
            } else {
                this.extendTimeBoundary = tasks.length > 0 ? tasks[0].start_time : this.minTime;
                let _ebx = this.extendTimeBoundary;
                this.extendBarHeight = this.initBarHeight;
                this.extendRegionHeight = tasks.length * this.extendBarHeight;
                if (this.extendRegionHeight > 0.8 * this.size) {
                    this.extendBarHeight = this.size * 0.8 / tasks.length;
                    this.extendRegionHeight = tasks.length * this.extendBarHeight;
                }

                this.extendRegionY = (this.size - this.extendRegionHeight) / (smallerNum + largerNum) * smallerNum;
                this.extendTaskList = tasks;

                this.upperHeight = this.extendRegionY;
                this.downHeight = this.size - this.upperHeight - this.extendRegionHeight;
                this.upperRight = this.xScale(this.extendTimeBoundary);
                this.lowerLeft = this.upperRight;

                let yUScale = d3.scaleLinear().domain([this.minTime, this.extendTimeBoundary]).range([0, this.extendRegionY]);
                let yLScale = d3.scaleLinear().domain([this.extendTimeBoundary, this.maxTime])
                    .range([this.extendRegionY + this.extendRegionHeight, this.size - 20]);
                this.yScale = function (timeStamp) {
                    if (timeStamp < _ebx) {
                        return yUScale(timeStamp);
                    } else {
                        return yLScale(timeStamp);
                    }

                }
            }


            if (this.showDataflow) {
                // this.computeDelayCnt()
                // this.drawDelayMatrix()
                // this.drawFetch()
                this.computeFetchGlyphs()
            }
            // let contourGenerator = d3.contourDensity()
            //     .x(d => this.xScale(d.srcTask.end_time))
            //     .y(d => this.yScale(d.dstTask.start_time))
            //     .size([this.size, this.size])
            //     .bandwidth(1)
            //     .cellSize(1)
            //     .weight(() => {
            //         return 3
            //     });
            // contourGenerator.thresholds([1])
            // let data = contourGenerator(this.dataFlow)
            // this.contourData = data;
            // console.log('length ------ ', this.dataFlow);

            // this.yScale = function(timeStamp){
            //     if(timeStamp < _ebx){
            //         return yUScale(timeStamp);
            //     }else{
            //         return yLScale(timeStamp);
            //     }
            //
            // }

            // console.log('number of selected tasks', this.id, this.extendTaskList.length);

            // this.yScale = function(){
            //     let upperScale = d3.scaleLinear().domain([0, 100]).range([this.countHeight, 5]);
            //     return upperScale
            // }
            d3.select(this.$el).select('.extendTaskList').attr('transform', 'translate(' + [0, this.extendRegionY] + ')')
            // const memLine = d3.line().x(d => this.xScale(d.timestamp)).y(d => this.yScale(d.value));
            // console.log('sere', memLine(memoryUsage))

        },
        interaction() {

            if (this.interaction == 'zoom') {
                this.svg = d3.select(this.$el);
                var zoom = d3.zoom()
                    .scaleExtent([-13, 12])
                    .on('zoom', () => {
                        this.svg.select('.rootContainer').attr('transform', d3.event.transform)
                    });

                this.svg.call(zoom);
            } else if (this.interaction == 'brush') {
                this.svg = d3.select(this.$el);
                this.svg.call(d3.zoom().on('zoom', null));
            }
        },
        directShown() {
            if (this.showDataflow) {
                // this.computeDelayCnt()
                // this.drawDelayMatrix()
                this.drawFetch()
            }
        },
        selectionRegion: {
            handler(timeSelection) {
                if (this.xScale) {
                    this.timeSelectRegion.x1 = this.xScale(timeSelection.minStartTime);
                    this.timeSelectRegion.x2 = this.xScale(timeSelection.maxEndTime);
                    this.timeSelectRegion.y1 = this.xScale(timeSelection.minStartTime);
                    this.timeSelectRegion.y2 = this.xScale(timeSelection.maxStartTime);
                }
            },
            deep: true
        }
    },
    computed: {

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
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema
        }),
        matrixDiagMin() {
            return this.app.matrixDiagMin
        },
        matrixDiagMax() {
            return this.app.matrixDiagMax
        },
        selectionRegion() {
            return this.app.timeSelection
        },
        renderSign() {
            return this.app.renderSign
        },
        maxTime() {
            return this.app.maxTime
        },
        minTime() {
            return this.app.minTime
        },
        vMaxTime() {
            return this.app.vMaxTime
        },
        metrics() {
            return this.app.metrics
        },
        taskMap() {
            return this.app.taskMap
        },
        dataFlow() {
            return this.app.dataFlow
        },
        counters() {
            return this.app.counters
        },
        maxCSize() {
            return this.app.maxCSize
        },
        contourFillColor() {
            // return d3.scaleSequential(d3.interpolateGreys)
            //     .domain([0, d3.max(this.contourData, d => +d.value)]);
            return d3.scaleSequential(d3.interpolateGreys)
                .domain([0, d3.max(this.contourData, d => +d.value)]);
        },
        loaded() {
            if (this.taskList.length == 0) {
                return false
            } else {
                return true
            }
        },
        timeSelected() {
            let _sum = this.selectionRegion.startTime + this.selectionRegion.endTime;

            if (_sum > 0) {
                return true;
            } else {
                return false;
            }
        },
        dependencyColor0() {
            if (!this.dependencyColorScale) {
                return '#ffffff'
            }
            return this.dependencyColorScale(0)
        },
        dependencyColor1() {
            if (!this.dependencyColorScale) {
                return '#ffffff'
            }
            return this.dependencyColorScale(this.maxCSize)
        },
        matrixRefDuration() {
            return this.app.matrixRefDuration
        },
        refLineOffset() {
            if (!this.xScale) return 0
            return this.xScale(this.matrixRefDuration) - this.xScale(0)
        }
    }
}
</script>

<style scoped>

</style>
