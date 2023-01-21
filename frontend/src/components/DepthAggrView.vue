<template>
  <el-row style="height: 100%; width: 100%">
    <div>
      <el-slider
          v-show="false"
          v-model="mergeCount"
          :step="1"
          @change="changeMergeCount"
          :min="0"
          :max="maxMergeCount"
          show-stops>
      </el-slider>
    </div>
    <svg style="height: 100%; width: 100%">
      <defs>
        <linearGradient v-for="[nodeId, colorTicks] in Array.from(colorPropMap.entries())"
                        :key="nodeId"
                        :id="'grad-' + nodeId" x1="0" x2="1" y1="0" y2="0">
          <stop v-for="(colorTick, i) in colorTicks" :key="i"
                :offset="colorTick.percent + '%'" :stop-color="colorTick.color"/>
        </linearGradient>
<!--        <linearGradient id="Gradient1" x1="0" x2="1" y1="0" y2="0">-->
<!--          <stop offset="0%" stop-color="red"/>-->
<!--          <stop offset="50%" stop-color="black" stop-opacity="0"/>-->
<!--          <stop offset="100%" stop-color="blue"/>-->
<!--        </linearGradient>-->
      </defs>
      <g v-if="loaded" class="progressContainer">
        <g class="nodeContainer">
          <g v-for="(node) in nodes" v-bind:key="node.id"
             :transform="'translate(' +  [node.data.x0 , node.data.y] + ')'">
            <rect :height="layoutConfig.vertexHeight"
                  :width="node.data.x1 - node.data.x0"
                  :stroke="'grey'" stroke-width="2"
                  :fill="'url(#grad-' + node.id + ')'"
                  rx="2" ry="2"
            >{{ node.data.type }}</rect>
            <text font-size="10px">{{ node.data.type }}</text>
          </g>
        </g>
        <g class="edgeContainer">
          <text v-for="(edge, i) in edges" :key="'e' + i"
                :x="(edge.src.data.x1 + edge.dst.data.x0) / 2"
                :y="(edge.src.data.y + edge.dst.data.y) / 2"
                :dx="0" :dy="10"
                text-anchor="middle"
            >{{ i /*+ ' ' + edge.data.toFixed(1)*/}}</text>
          <path v-for="(path, i) in paths" :key="i"
                :d="path" fill="none"
                stroke="rgba(50, 50, 50, 0.5)" stroke-width="1" ></path>
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
    name: "DepthAggrView",
    components: {
    },
    data() {
      return {
        containerWidth: 0,
        containerHeight: 0,
        mergeCount: 0,
        maxMergeCount: 10,
      }
    },
    mounted() {
      let width = this.$el.clientWidth;
      let height = this.$el.clientHeight;
      this.containerHeight = height;
      this.containerWidth = width;
      this.$store.commit('simulation/updateIncrementalScale', {'width': width, 'height': height});
    },
    watch: {
      loaded() {
        if (this.loaded == true) {
          this.svg = d3.select(this.$el).select('svg');
          let zoom = d3.zoom()
            .scaleExtent([-3, 8])
            .on('zoom', function () {
              d3.select('.progressContainer').attr('transform', d3.event.transform);
            });
          this.svg.call(zoom);

          console.log('tasks', this.taskList)

          this.clusterNumber = this.maxMergeCount = Math.max(1, this.graph.nodes.length)
        }
      },
    },
    methods: {
      changeMergeCount(mergeCount) {
        if (this.loaded) {
          this.$store.commit('simulation/changeMergeCount', mergeCount)
          this.$store.commit('simulation/updateLayout')
        }
      }
    },
    computed: {
      loaded() {
        return !!this.graph
      },
      ...mapState('simulation', {
        colorSchema: state => state.colorSchema,
        graph: state => state.mstAggrGraph,
        layoutConfig: state => state.layoutConfig,
        taskList: state => state.taskList,
      }),
      nodes() {
        return this.graph ? this.graph.nodes : []
      },
      edges() {
        return this.graph ?
          [...this.graph.edges].sort((e1, e2) => e2.data - e1.data) : []
      },
      texts() {
        return this.nodes.map(node => {
          let text = ''
          node.data.vertexIdList.forEach(vtxName => {
            let group = vtxName.match(/([A-Z]).*\s(\d*)/)
            text += group[1] + group[2] + ' '
          })
          return text
        })
      },
      paths() {
        return this.edges.map(e => {
          // temp
          let offsetY = this.layoutConfig.vertexHeight / 2
          let sx = e.src.data.x1,
              sy = e.src.data.y + offsetY,
              dx = e.dst.data.x0,
              dy = e.dst.data.y + offsetY
          if (dx <= sx) {
            dx = Math.min(e.dst.data.x1, sx + 20)
            dy += ((sy < dy) ? -1 : 1 ) * offsetY
          }
          dx = Math.max(sx, dx)
          let points = [
            [sx, sy],
            [(sx + dx) / 2, sy],
            [(sx + dx) / 2, dy],
            [dx, dy]
          ]
          return curveGen(points)
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
        console.log('vertexTasksMap', vertexTasksMap)

        const taskListMap = new Map()   // layout node -> tasks
        this.nodes.forEach(node => {
          const tasks = []
          node.data.vertexIdList.forEach(vertexName => {
            tasks.push(...vertexTasksMap.get(vertexName))
          })
          taskListMap.set(node.id, tasks)
        })
        console.log('taskListMap', taskListMap)

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
      }
    }
  }
</script>

<style scoped>

</style>
