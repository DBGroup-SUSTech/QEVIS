<template>
    <el-row style="height: 100%; width: 100%">

    <div class="bottom-group">
      <svg width="17" height="17" @click="toUnfoldMode"
           t="1630482904247" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2517"><path d="M823.7 161.5H561.3v64h190L540.2 436.6l45.2 45.2 212.4-212.4v190h64V199.6c0-21-17.1-38.1-38.1-38.1zM437 544.1L224.6 756.4v-190h-64v259.8c0 21 17.1 38.1 38.1 38.1h262.4v-64h-190l211.1-211.1-45.2-45.1z" :fill="unfoldIconColor" p-id="2518"></path></svg>
      <svg width="17" height="17" @click="toFoldMode"
           t="1630482931721" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2658"><path d="M867.9 204.1l-45.3-45.3-212.4 212.5v-190h-64v259.9c0 21 17.1 38.1 38.1 38.1h262.5v-64H656.7l211.2-211.2zM442.7 547.8H180.3v64h190L159.2 823l45.3 45.3 212.4-212.4v190h64v-260c-0.1-21-17.2-38.1-38.2-38.1z" :fill="foldIconColor" p-id="2659"></path></svg>
      <svg width="17" height="17" @click="changeShowStepView"
           t="1630570653155" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3778"><path d="M960 160v704H497.312l128.192-352L497.28 160H960zM433.056 160l128.512 352-128.512 352H64V160h369.056zM296.64 346.88H243.36c-2.4 22.08-10.56 39.84-48 39.84v54.72h37.44V704H296.64V346.88z m497.6-4.32h-12.96c-48.96 0-65.28 33.12-65.28 66.72v62.88h60V416.96c0-11.52 2.88-16.32 12-16.32 8.64 0 12 4.8 12 16.32v21.6c0 12.96-0.48 23.04-17.76 51.84l-30.72 50.88-9.28 15.68c-28.48 49.216-33.472 69.184-33.92 105.056V704h161.76v-61.92h-107.04v-4.32c0.416-7.296 4.576-20.416 37.44-63.84l26.72-34.496 8.32-11.104c26.688-34.72 30.56-53.376 31.104-84l0.096-33.12c0-46.08-27.36-68.64-72.48-68.64z" :fill="stepViewIconColor" p-id="3779"></path></svg>
    </div>

    <svg style="height: 100%; width: 100%;" class="tdag-container">
      <defs>
        <linearGradient v-for="[nodeId, colorTicks] in Array.from(colorPropMap.entries())"
                        :key="nodeId"
                        :id="'grad-' + nodeId.replace(' ', '-')" x1="0" x2="1" y1="0" y2="0">
          <stop v-for="(colorTick, i) in colorTicks" :key="i"
                :offset="colorTick.percent + '%'" :stop-color="colorTick.color"/>
        </linearGradient>
      </defs>
        <circle class="testCircle" r="3" cx="50" cy="100" fill="red"></circle>
        <g>
            <g>
                <g v-if="loaded" class="progressContainer">
                    <g class="nodeContainer" v-show="!showStepView">
                        <g v-for="(node) in nodes" v-bind:key="node.id"
                           :transform="'translate(' +  [node.data.layout.x0 , node.data.layout.y] + ')'">
                            <rect :height="layoutConfig.vertexHeight"
                                  :width="node.data.layout.x1 - node.data.layout.x0"
                                  :stroke="getNodeStroke(node)"
                                  :stroke-width="getStrokeWidth(node)"
                                  :fill="'url(#grad-' + node.id.replace(' ', '-') + ')'"
                                  rx="2" ry="2"
                                  class="vertex-rect"
                                  @click="clickNode(node)">
                                <title>{{ getNodeLabel(node) }}</title>
                            </rect>
                            <text font-size="10px">{{ getNodeLabel(node) }}</text>
                        </g>
                    </g>
                    <g class="nodeContainer" v-show="showStepView">
                        <g v-for="node in nodes" v-bind:key="node.id"
                           :transform="'translate(' +  [node.data.layout.x0 , node.data.layout.y] + ')'">

                            <rect v-for="(stepData, i) in node.data.stepDataList" :key="stepData.stepId"
                                  class="progress vertex-rect"
                                  :x="stepData.offsetX" :width="stepData.width"
                                  :fill="stepData.color" :height="layoutConfig.vertexHeight"
                                  stroke-width="1" stroke-opacity="0"
                                  @click="clickNode(node)">
                                <title>{{ 'step-' + i }}</title>
                            </rect>
                            <rect :height="layoutConfig.vertexHeight" fill="none"
                                  :width="node.data.layout.x1 - node.data.layout.x0"
                                  :stroke="getNodeStroke(node)"
                                  :stroke-width="getStrokeWidth(node)"
                                  class="vertex-rect"
                                  @click="clickNode(node)">
                            ></rect>
                            <text font-size="10px">{{ getNodeLabel(node) }}</text>
                        </g>
                    </g>
                    <g class="edgeContainer">
                        <!--          <text v-for="(edge, i) in edges" :key="'e' + i"-->
                        <!--                :x="(edge.src.data.x1 + edge.dst.data.x0) / 2"-->
                        <!--                :y="(edge.src.data.y + edge.dst.data.y) / 2"-->
                        <!--                :dx="0" :dy="10"-->
                        <!--                text-anchor="middle"-->
                        <!--            >{{ i /*+ ' ' + edge.data.toFixed(1)*/}}</text>-->
                        <path v-for="({path, edge}, i) in pathModels" :key="i"
                              :d="path" fill="none"
                              stroke="rgba(50, 50, 50, 0.5)"
                              :stroke-width="getEdgeStrokeWidth(edge)" ></path>
                    </g>
                </g>
            </g>
            <g class="timeAxis" transform="translate(0, 20)">
                <rect y=-20 fill="steelblue" :width="width" height="20" opacity="0.3"></rect>
            </g>
        </g>

      <g v-if="!loaded">
        <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
          No data selected
        </text>
      </g>
      <g class="detailStructure"></g>
    </svg>
  </el-row>
</template>

<script>
  /* eslint-disable */
  import * as d3 from "d3";
  import {mapState} from "vuex";
  import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";

const curveGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveBasis)

function getTrend(taskList) {
    let usage = [];
    let trend = [];
    let count = 0;
    taskList.forEach(task => {
        usage.push({'type': 'start', 'time': task.start_time});
        usage.push({'type': 'end', 'time': task.end_time});
    })
    usage.sort((a, b) => (a.time > b.time) ? 1 : -1);

    usage.forEach(u => {
        if (u.type === 'start') {
            count += 1;
        } else if (u.type === 'end') {
            count -= 1;
        } else {
            console.log('error type')
        }
        if (trend.length > 0 && trend[trend.length - 1].time === u.time) {
            trend[trend.length - 1].count = count;
        } else {
            if (trend.length == 0) {
                trend.push({'time': u.time, 'count': 0})
            }
            // console.log('count', count)
            trend.push({'time': u.time, 'count': count})
        }
    })

    return trend
}

/**
 * @param trend
 * @param timeInterval in ms
 * @param globalMaxCount
 * @returns {{percent:number, color:string}[]}
 */
function getColorTicks(trend, timeInterval, globalMaxCount) {
    if (trend.length === 0) {
        return []
    }
    const timeExtent = d3.extent(trend, u => u.time)

    const getTimePercent = function getTimePercent(time) {
        if (time === timeExtent[0]) {
            return 0
        }
        return (time - timeExtent[0]) / (timeExtent[1] - timeExtent[0]) * 100
    }

    const colorGen = d3.interpolateBlues
    const colorTicks = []

    trend.forEach(t => {
        // console.log(t.count, globalMaxCount)
        const color = colorGen(t.count / globalMaxCount)
        colorTicks.push({percent: getTimePercent(t.time), color})
    })

    return colorTicks
}

export default {
    name: "TlAggrView",
    components: {
    },
    data() {
        return {
            containerWidth: 0,
            containerHeight: 0,
            mergeCount: 0,
            maxMergeCount: 10,

            showStepView: false,

            testTransform: '',
            staticXScaleCopy: undefined,
            newXScale: undefined,
            width: 0
        }
    },
    mounted() {
        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;
        this.width = width
        this.containerHeight = height;
        this.containerWidth = width;
        this.$store.commit('simulation/updateIncrementalScale', {'width': width, 'height': height});
    },
    watch: {
        loaded() {
            if (this.loaded == true) {
                let _this = this
                const domain = this.stateXScale.domain()
                let start = d3.min(this.taskList, task => task.start_time)
                let end = d3.max(this.taskList, task => task.end_time)
                domain[0] -= start
                domain[1] -= start
                let generateScale=()=>{
                    let axis = d3.axisTop(this.newXScale)
                    axis.ticks(15).tickFormat(d=> (d) / 1000 + 's').tickSize(3)
                    return axis
                }

                let updateAxis = () =>{
                    d3.select(_this.$el).select('.timeAxis').call(generateScale());
                    d3.select(this.$el).select('.timeAxis').selectAll('text').style('font-size', 10)
                }
                if(this.staticXScaleCopy == undefined) {
                    this.staticXScaleCopy = d3.scaleLinear().domain(domain).range(this.stateXScale.range())
                }
                this.newXScale = d3.scaleLinear().domain(domain).range(this.stateXScale.range())

                d3.select('.testCircle').attr('cx',this.newXScale(start))


                console.log('= d3.min(taskList, task => task.start_time', start, end, (end - start), (end - start) / 1000)

                let width = this.$el.clientWidth;
                let height = this.$el.clientHeight;

                this.svg = d3.select(this.$el).select('.tdag-container');
                let zoom = d3.zoom()
                    .scaleExtent([-3, 8])
                    .extent([[20, 20], [width-20, height-20]])
                    .on('zoom', function () {
                        d3.select('.progressContainer').attr('transform', d3.event.transform);
                        _this.newXScale = d3.event.transform.rescaleX(_this.staticXScaleCopy);
                        updateAxis()

                    });
                this.svg.call(zoom);
                updateAxis()
                this.clusterNumber = this.maxMergeCount = Math.max(1, this.graph.nodes.length)
            }
        }
    },
    methods: {
      changeMergeCount(mergeCount) {
        if (this.loaded) {
          this.$store.commit('simulation/changeMergeCount', mergeCount)
          this.$store.commit('simulation/updateLayout')
        }
      },
      toUnfoldMode() {
        console.log('unfold')
        if (this.tdagCursorMode === TDAGCursorMode.UNFOLD) {
          this.$store.commit('simulation/changeTDAGCursorMode', TDAGCursorMode.NORMAL)
        } else {
          this.$store.commit('simulation/changeTDAGCursorMode', TDAGCursorMode.UNFOLD)
        }
      },
      toFoldMode() {
        console.log('fold')
        if (this.tdagCursorMode === TDAGCursorMode.FOLD) {
          this.$store.commit('simulation/changeTDAGCursorMode', TDAGCursorMode.NORMAL)
        } else {
          this.$store.commit('simulation/changeTDAGCursorMode', TDAGCursorMode.FOLD)
        }
      },
        changeShowStepView() {
            this.showStepView ^= true
        },
      clickNode(node) {
        this.$store.commit('simulation/handleTDAGNodeClick', node)
      },
      getNodeLabel(node) {
        const idList = node?.data?.vertexIdList
        if (!idList) return ''
        return idList.length === 1 ? idList[0] : (idList.length + ' Nodes')
      },
      getNodeStroke(node) {
        const layout = node.data.layout
        if (layout.selectCurrent) {
          return this.colorSchema['selectCurrent']
        } else if (layout.selectAsProvider) {
          return this.colorSchema['selectAsProvider']
        } else if (layout.selectAsConsumer) {
          return this.colorSchema['selectAsConsumer']
        } else {
          return 'grey'
        }
      },
      getStrokeWidth(node) {
        const layout = node.data.layout
        if (layout.selectCurrent || layout.selectAsProvider || layout.selectAsConsumer) {
          return 4
        } else {
          return 2
        }
      },
      getEdgeStrokeWidth(edge) {
        const srcLayout = edge.src.data.layout,
              dstLayout = edge.dst.data.layout
        const toBold = [srcLayout, dstLayout].every(layout => {
          return layout.selectCurrent || layout.selectAsProvider || layout.selectAsConsumer
        })
        return toBold ? 2.5 : 1
      }
    },
    computed: {
      loaded() {
        return !!this.graph
      },
      ...mapState('simulation', {
        colorSchema: state => state.colorSchema,
        graph: state => state.visGraph,
        layoutConfig: state => state.layoutConfig,
        taskList: state => state.taskList,
        dagRoot: state => state.dagRoot,
        gapPixel: state => state.gapPixel,

        tdagCursorMode: state => state.tdagCursorMode,
          stateXScale: state => state.xScale
      }),
      orderMap() {
        const originOrderMap = this.$store.state.simulation.orderMap
        let orderMap = new Map()
        Object.keys(originOrderMap).forEach(vertexName => {
          orderMap.set(vertexName, originOrderMap[vertexName])
        })
        return orderMap
      },
      nodes() {
        return this.graph ? this.graph.nodes : []
      },
      edges() {
        return this.graph ?
          [...this.graph.edges].sort((e1, e2) => e2.data - e1.data) : []
      },
      pathModels() {
        return this.edges.map(e => {
          let offsetY = this.layoutConfig.vertexHeight / 2
          let sx = e.src.data.layout.x1,
              sy = e.src.data.layout.y + offsetY,
              dx = e.dst.data.layout.x0,
              dy = e.dst.data.layout.y + offsetY
          if (dx <= sx) {
            dx = Math.min(e.dst.data.layout.x1, sx + 20)
            dy += ((sy < dy) ? -1 : 1 ) * offsetY
          }
          dx = Math.max(sx, dx)
          let points = [
            [sx, sy],
            [(sx + dx) / 2, sy],
            [(sx + dx) / 2, dy],
            [dx, dy]
          ]
          return {path: curveGen(points), edge: e}
        })
      },
      colorPropMap() {
        const ret = new Map()

            // cluster tasks by vertex
            const vertexTasksMap = new Map()
            this.taskList.forEach(task => {
                if (!vertexTasksMap.has(task.vec_name)) {
                    vertexTasksMap.set(task.vec_name, [])
                }
                vertexTasksMap.get(task.vec_name).push(task)
            })
            // console.log('vertexTasksMap', vertexTasksMap)

            const taskListMap = new Map()   // layout node -> tasks
            this.nodes.forEach(node => {
                const tasks = []
                node.data.vertexIdList.forEach(vertexName => {
                    tasks.push(...vertexTasksMap.get(vertexName))
                })
                taskListMap.set(node.id, tasks)
            })
            // console.log('taskListMap', taskListMap)

            const trendMap = new Map()
            Array.from(taskListMap.entries()).forEach(entry => {
                const [nodeId, tasks] = entry
                const trend = getTrend(tasks)
                trendMap.set(nodeId, trend)
            })

            const maxCount = d3.max(Array.from(trendMap.values()), trend => d3.max(trend, t => t.count))
            Array.from(trendMap.entries()).forEach(entry => {
                const [nodeId, trend] = entry
                ret.set(nodeId, getColorTicks(trend, 100, maxCount))
            })
            return ret
        },
        unfoldIconColor() {
            return this.tdagCursorMode === TDAGCursorMode.UNFOLD ? '#539fff' : '#231815'
        },
        foldIconColor() {
            return this.tdagCursorMode === TDAGCursorMode.FOLD ? '#539fff' : '#231815'
        },
        stepViewIconColor() {
            return this.showStepView ? '#539fff' : '#231815'
        }
    }
}
</script>

<style scoped>
.bottom-group {
    position: absolute;
    right: 0;
    margin: 10px;
    padding: 2px;
    float: right;
    border-radius: 4px;
    background: rgba(241, 241, 241, 0.62);
}
.icon {
    float: left;
    cursor: pointer;
    margin: 2px;
    border: rgba(255, 255, 255, 0) solid 1px;
    border-radius: 3px;
    transition: border 0.4s
}
.icon:hover {
    border: rgb(206, 206, 206) solid 1px;
}

.vertex-rect {
    cursor: pointer;
}
</style>
