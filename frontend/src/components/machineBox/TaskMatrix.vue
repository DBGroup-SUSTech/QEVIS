<template>
  <div>
    <svg style="height: 100%; width: 100%;left:0; top:0">
      <g :transform="containerTransform" class="rootContainer">
        <g v-show="showDataflow">
          <!--                    <foreignObject :height="containerWidth" :width="containerWidth">-->
          <!--                        <canvas style="height: 100%; width: 100%;object-fit:contain;"> </canvas>-->
          <!--                    </foreignObject>-->
          <rect v-for="(rect, i) in fetchRects" :key="i"
                :fill="rect.highlight ? colorSchema['fetchHighlight'] : rect.fill"
                :x="rect.x" :y="rect.y"
                :width="rect.width" :height="rect.height"
                @mouseenter="fetchMouseEnter(rect)"
                @mouseleave="fetchMouseLeave(rect)"
          ></rect>
        </g>

        <g v-if="loaded">
          <g class="matrix" :transform="matrixTransform">
            <rect fill="none" stroke="grey" fill-opacity="0.2"
                  :width="size" :height="size" :stroke-width="0.5 / transformK"></rect>
            <!--                        <rect class="upperRegion" stroke="grey" :width="size" stroke-width="0.5"-->
            <!--                              :height="upperHeight" fill="grey" fill-opacity="0.05"></rect>-->
            <!--                        <rect class="lowerRegion" stroke="grey" :width="size" stroke-width="0.5"-->
            <!--                              :y="size-downHeight" :height="downHeight" fill="grey" fill-opacity="0.05"></rect>-->

            <TaskNode v-for="task in taskList"
                      :key="task.task_id" :xScale="xScale" :yScale="yScale"
                      :transform-k="transformK"
                      v-show="!task.selectedToExtend"
                      :task="task" :matrixDiagMin="matrixDiagMin" :matrixDiagMax="matrixDiagMax"
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
    </svg>
  </div>
</template>

<script>
import {mapState} from "vuex";
import TaskNode from "@/components/ScatterView/TaskNode";
import TaskNodeExtend from "@/components/ScatterView/TaskNodeExtend";
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
  name: "Task",
  props: ['taskList', 'id', 'ch', 'status', 'showDataflow', 'interaction', 'directShown'],
  data() {
    let ch = 30
    if (this.ch !== undefined) {
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

      upperHeight: 0,
      upperRight: 0,
      downHeight: 0,
      lowerLeft: 0,
      contourData: undefined,

      context: undefined,

      delayCntMatrix: null,

      fetchRects: [],
      transformK: 1,

      provideMap: new Map(),
      consumeMap: new Map(),
      srcId2ShownFetchRects: null,
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
    this.size = Math.min(this.$el.clientWidth, this.$el.clientHeight) - (2 * this.gap);
    // this.countHeight = this.size - this.gap;
    this.$store.commit('simulation/updateTaskScale', {
      'width': this.size,
      'height': this.size,
      'size': this.size,
      'upperHeight': this.countHeight,
    })

    // let canvas = d3.select(this.$el).select('canvas')
    //     .attr('width', this.size)
    //     .attr('height', this.size)
    // this.context = canvas.node().getContext('2d');

    if (this.interaction === 'zoom') {
      this.svg = d3.select(this.$el);
      var zoom = d3.zoom()
          .scaleExtent([-13, 12])
          .on('zoom', () => {
            this.svg.select('.rootContainer').attr('transform', d3.event.transform)
            this.transformK = d3.event.transform.k
            // this.$nextTick(() => {
            //   this.repaint()
            // })
          });

      this.svg.call(zoom);
    }

    // this.yScale = d3.scaleLinear().domain([0, 100]).range([this.countHeight, 5]);


  },
  methods: {
    geoPath(data) {
      return d3.geoPath()(data);
    },
    // drawFetch() {
    //     this.context.clearRect(0, 0, this.size, this.size);
    //     // console.log('max---', this.maxCSize)
    //     let colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, this.maxCSize]);
    //     let w = (this.size - 20) / 200, h = (this.size - 20) / 200
    //     this.dataFlow.forEach((d) => {
    //         if (d.label === 'NORMAL') {
    //             if (this.directShown === 'src' && d.srcTask['machine_id'] !== this.id
    //                 || this.directShown === 'dst' && d.dstTask['machine_id'] !== this.id) {
    //                 return
    //             }
    //             const xTime = d.dstTask.start_time
    //             const yTime = d.srcTask.end_time
    //             if (xTime >= yTime) {
    //                 return
    //             }
    //             this.context.fillStyle = colorScale(d.csize);
    //             this.context.fillRect(this.xScale(xTime) - w / 2, this.yScale(yTime) - h / 2, w, h)
    //         } else {
    //             d.srcTasks.forEach(srcTask => {
    //                 if (this.directShown === 'src' && srcTask['machine_id'] !== this.id
    //                     || this.directShown === 'dst' && d.dstTask['machine_id'] !== this.id) {
    //                     return
    //                 }
    //                 const xTime = d.dstTask.start_time
    //                 const yTime = srcTask.end_time
    //                 if (xTime >= yTime) {
    //                     return
    //                 }
    //                 let srcTaskCounters = this.counters[srcTask['task_id']]
    //                 this.context.fillStyle = colorScale(srcTaskCounters['OUTPUT_BYTES'])
    //                 this.context.fillRect(this.xScale(xTime) - w / 2,
    //                     this.yScale(yTime) - h / 2, w, h)
    //             })
    //         }
    //     })
    // },
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
    updateShownFetchRects(srcTask, fetchRect) {
      let fetchRects = this.srcId2ShownFetchRects.get(srcTask.task_id)
      if (!fetchRects) {
        fetchRects = []
        this.srcId2ShownFetchRects.set(srcTask.task_id, fetchRects)
      }
      fetchRects.push(fetchRect)
    },
    computeFetchRect() {
      this.provideMap = new Map()
      this.consumeMap = new Map()
      this.srcId2ShownFetchRects = new Map()

      const fetchRects = []
      let colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, this.maxCSize]);
      let w = this.size / 50 / this.transformK, h = this.size / 50 / this.transformK
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
          const fetchRect = {
            fill: colorScale(d.csize),
            x: this.xScale(xTime) - w / 2,
            y: this.yScale(yTime) - h / 2,
            width: w,
            height: h,
            fetch: d,
            srcTask: d.srcTask,
            dstTask: d.dstTask,
            highlight: false,
          }
          fetchRects.push(fetchRect)
          this.updateShownFetchRects(d.srcTask, fetchRect)
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
            const fetchRect = {
              fill: colorScale(srcTaskCounters['OUTPUT_BYTES']),
              x: this.xScale(xTime) - w / 2,
              y: this.yScale(yTime) - h / 2,
              width: w,
              height: h,
              fetch: d,
              srcTask: srcTask,
              dstTask: d.dstTask,
              highlight: false,
            }
            fetchRects.push(fetchRect)
            this.updateShownFetchRects(srcTask, fetchRect)
          })
        }
      })
      this.fetchRects = fetchRects
    },
    repaint() {
      if (this.showDataflow) {
        this.computeFetchRect()
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
    taskMouseEnter(task) {
      task.layout.selectCurrent = true
      this.$store.commit('simulation/changeHighlightByTask', {
        vertices: [task.vec_name],
        type: 'selectCurrent',
        value: true,
      })
      const providers = this.provideMap.get(task.task_id)
      const consumers = this.consumeMap.get(task.task_id)
      if (providers) {
        providers.forEach(p => {
          p.layout.selectAsProvider = true
          const fetchRects = this.srcId2ShownFetchRects.get(p.task_id)
          if (fetchRects) {
            fetchRects.forEach(r => r.highlight = true)
          }
        })
        // also highlight vertex
        const vertexSet = new Set()
        providers.forEach(t => vertexSet.add(t.vec_name))
        this.$store.commit('simulation/changeHighlightByTask', {
          vertices: Array.from(vertexSet),
          type: 'selectAsProvider',
          value: true,
        })
      }
      if (consumers) {
        consumers.forEach(c => c.layout.selectAsConsumer = true)
        const vertexSet = new Set()
        consumers.forEach(t => vertexSet.add(t.vec_name))
        this.$store.commit('simulation/changeHighlightByTask', {
          vertices: Array.from(vertexSet),
          type: 'selectAsConsumer',
          value: true,
        })
      }
    },
    taskMouseLeave(task) {
      task.layout.selectCurrent = false
      this.$store.commit('simulation/changeHighlightByTask', {
        vertices: [task.vec_name],
        type: 'selectCurrent',
        value: false,
      })
      const providers = this.provideMap.get(task.task_id)
      const consumers = this.consumeMap.get(task.task_id)
      if (providers) {
        providers.forEach(p => {
          p.layout.selectAsProvider = false
          const fetchRects = this.srcId2ShownFetchRects.get(p.task_id)
          if (fetchRects) {
            fetchRects.forEach(r => r.highlight = false)
          }
        })
        // also highlight vertex
        const vertexSet = new Set()
        providers.forEach(t => vertexSet.add(t.vec_name))
        this.$store.commit('simulation/changeHighlightByTask', {
          vertices: Array.from(vertexSet),
          type: 'selectAsProvider',
          value: false,
        })
      }
      if (consumers) {
        consumers.forEach(c => c.layout.selectAsConsumer = false)
        const vertexSet = new Set()
        consumers.forEach(t => vertexSet.add(t.vec_name))
        this.$store.commit('simulation/changeHighlightByTask', {
          vertices: Array.from(vertexSet),
          type: 'selectAsConsumer',
          value: false,
        })
      }
    },
    fetchMouseEnter(fetchRect) {
      fetchRect.highlight = true
      fetchRect.srcTask.layout.selectAsProvider = true
      fetchRect.dstTask.layout.selectAsConsumer = true
      this.$store.commit('simulation/changeHighlightByTask', {
        vertices: [fetchRect.srcTask.vec_name],
        type: 'selectAsProvider',
        value: true,
      })
      this.$store.commit('simulation/changeHighlightByTask', {
        vertices: [fetchRect.dstTask.vec_name],
        type: 'selectAsConsumer',
        value: true,
      })
    },
    fetchMouseLeave(fetchRect) {
      fetchRect.highlight = false
      fetchRect.srcTask.layout.selectAsProvider = false
      fetchRect.dstTask.layout.selectAsConsumer = false
      this.$store.commit('simulation/changeHighlightByTask', {
        vertices: [fetchRect.srcTask.vec_name],
        type: 'selectAsProvider',
        value: false,
      })
      this.$store.commit('simulation/changeHighlightByTask', {
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
        this.computeFetchRect()
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
      matrixDiagMin: state => state.matrixDiagMin,
      matrixDiagMax: state => state.matrixDiagMax,
      selectionRegion: state => state.application.timeSelection,
      renderSign: state => state.renderSign,
      maxTime: state => state.application.maxTime,
      minTime: state => state.application.minTime,
      vMaxTime: state => state.application.vMaxTime,
      metrics: state => state.application.metrics,
      taskMap: state => state.application.taskMap,
      dataFlow: state => state.application.dataFlow,
      counters: state => state.application.counters,
      maxCSize: state => state.application.maxCSize,
      colorSchema: state => state.colorSchema
      // contourData: state=>{
      //     if(this){
      //         let contourGenerator = d3.contourDensity()
      //             .x(d => this.xScale(d.srcTask.end_time))
      //             .y(d => this.yScale(d.dstTask.start_time))
      //             .size([500, 500])
      //             .bandwidth(20)
      //             .cellSize(3)
      //             .weight(() => {
      //                 return 1
      //             });
      //         contourGenerator.thresholds(12)
      //         let data = contourGenerator(state.dataFlow)
      //         return data;
      //     }
      //     return null
      //
      // }
    }),
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
  }
}
</script>

<style scoped>

</style>
