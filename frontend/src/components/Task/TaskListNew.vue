<template>
  <div v-if="renderComponent">
    <el-select v-if="finishLoading" size="mini" style="margin-top: 10px; width: 200px" v-model="value"
               placeholder="请选择">
      <el-option
          v-for="item in options"
          :key="item"
          :label="item"
          :value="item">
      </el-option>
    </el-select>
    <svg :height="totalHeight + 80" style="margin-top: 10px; width: 100%">
      <g class="content" transform="translate(20, 0)">
        <g v-for="(vertex, index) in vertexList" :key="vertex.key">
          <VertexRow :data="vertex"
                     :index="index"
                     :start="startTime"
                     :end="endTime"
                     :widthRatio="widthRatio"
                     :columns="columns"
                     :width="width - 40"
                     :machineNames="machineNames"
                     :taskNum="taskNum"
                     :maxDuration="maxDuration"
                     :brothers="vertexList"
                     :headConfig="headConfig"
                     :srcNestMap="srcNestMap"
                     :dstNestMap="dstNestMap"
                     :timeScale="timeScale"
                     :counters="counters"
                     :contextType="value"
          ></VertexRow>
        </g>
      </g>
    </svg>
  </div>
</template>

<script>
import * as d3 from "d3";
import {mapGetters, mapState} from "vuex"
import VertexRow from './TaskNew/VertexRow'

export default {
  name: "TaskView",
  components: {
    VertexRow
  },
  data() {
    const _columns = ['vertex', 'machine', 'task', 'start', 'end', 'duration', 'step']
    const _ratio = Array(_columns.length).fill(1 / _columns.length)
    const unitHeight = 25
    const timeScale = d3.scaleLinear().domain([this.start, this.end])
    return {
      vertexList: [],
      unitHeight: unitHeight,
      detailHeight: 80,
      timeScale: timeScale,
      width: 0,
      widthRatio: _ratio,
      columns: _columns,
      startTime: Number.MAX_VALUE,
      endTime: Number.MIN_VALUE,
      maxDuration: 0,
      machineNames: [],
      pageHeight: 100,
      headConfig: {
        unitHeight: unitHeight,
        contextFill: 'white',
        strokeWidth: 0.3
      },
      renderComponent: true,
      taskNum: 0,
      srcNestMap: {},
      dstNestMap: {},
      headLength: 40,
      marginY: 3,
      textMarginY: 19,
      strokeColor: 'grey',
      machineSize: 0,
      values: undefined,
      dataCounters: undefined,
      options: ['Duration', 'TimeUsage'],
      value: 'Duration'
    }
  },
  methods: {
    sum(arr) {
      return d3.sum(arr)
    },
    generateTransform(x, y) {
      return 'translate(' + [x, y] + ')'
    },
    forceRerender() {
      // Remove my-component from the DOM
      this.renderComponent = false;

      this.$nextTick(() => {
        // Add the component back in
        this.renderComponent = true;
      });
    },
    dragFunc(index) {
      // let i = 0
      const dragstarted = () => {
        console.log('drag start')
      }

      const dragged = () => {
        const a = d3.event.x / this.width - this.sum(this.widthRatio.slice(0, index - 1))
        const b = this.sum(this.widthRatio.slice(0, index + 1)) - d3.event.x / this.width
        this.widthRatio[index - 1] = a
        this.widthRatio[index] = b
      }

      const dragended = () => {
        console.log('drag end')
      }

      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    }
  },
  watch: {
    finishLoading() {
      if (this.finishLoading === true) {
        Object.keys(Object.values(this.counters)[0]).forEach(val => {
          this.options.push(val)
        })
      }
    },
    fetchData() {
      if (this.fetchData === undefined){
        return
      }
      const nestArray = d3.nest().key(d => d.src).entries(this.fetchData)
          .filter(d =>  d !== null && d.key !== undefined && d.src !== undefined && d.key !== "undefined")
      const srcNestMap = d3.map(nestArray, d => d.key)
      const dstNestMap = d3.map(d3.nest().key(d => d.dst).entries(this.fetchData), d => d.key)
      this.srcNestMap = srcNestMap
      this.dstNestMap = dstNestMap
    },

    taskLength() {
      // this.taskListAll.forEach(task=>{
      //     task.type = 'task'
      //     task.task = task.task_id
      //     task.config = {height: this.unitHeight, detailHeight: this.detailHeight, unitHeight: this.unitHeight}
      // })
      this.taskNum = this.taskListAll?.length ?? 0
      this.machineNames = d3.map(this.taskListAll, d => d.machine_id).keys()
      const nestData = d3.nest().key(d => d.vec_name).key(d => d.machine_id).entries(this.taskListAll)
      nestData.forEach((vertex) => {
        vertex.config = {
          height: this.unitHeight,
          totalHeight: this.unitHeight,
          detailHeight: this.detailHeight,
          unitHeight: this.unitHeight
        }
        vertex.type = 'vertex'
        vertex.vertex = vertex.key
        vertex.extend = false
        vertex.detail = false
        vertex.values.forEach(machine => {
          machine.type = 'machine'
          machine.vertex = vertex.key
          machine.machine = machine.key
          machine.extend = false
          machine.detail = false
          machine.config = {
            height: this.unitHeight,
            totalHeight: this.unitHeight,
            detailHeight: this.detailHeight,
            unitHeight: this.unitHeight
          }
          machine.taskList = []
          machine.values.forEach(task => {
            task.type = 'task'
            task.vertex = vertex.key
            task.machine = machine.key
            task.task = task.task_id
            task.config = {
              height: this.unitHeight,
              totalHeight: this.unitHeight,
              detailHeight: this.detailHeight,
              unitHeight: this.unitHeight
            }
            machine.taskList.push(JSON.parse(JSON.stringify(task)))
          })
        })
      })
      this.vertexList = nestData
      this.values = this.taskListAll
      this.startTime = d3.min(this.taskListAll, d => d.start_time)
      this.endTime = d3.max(this.taskListAll, d => d.end_time)
      this.maxDuration = d3.max(this.taskListAll, d => d.end_time - d.start_time)
      this.timeScale.domain([this.startTime, this.endTime])
      // console.log('start end ', this.startTime, this.endTime, this.endTime - this.startTime)
      // console.log('nest data', nestData)
      this.forceRerender()
    }
  },
  mounted() {
    this.width = this.$el.clientWidth
    const _this = this
    d3.selectAll('.dragComponents').each(function (_, i) {
      d3.select(this).call(_this.dragFunc(i))
    })

    this.machineSize = this.unitHeight - this.marginY * 2 - 4 * 2
  },
  computed: {
    ...mapState('simulation', {
      taskListAll: state => state.application.taskList,
      counters: state => state.application.counters,
      finishLoading: state => state.finishLoading,
      fetchData: state => {
        if (state.application.fetchData.length === 0) {
          return undefined
        } else {
          return state.application.fetchData
        }

      }
    }),
    ...mapGetters('simulation', {
      simRunning: 'running',
    }),
    selectTaskList() {
      return [...this.selectTaskListOrigin]
    },
    taskLength() {
      return this.taskListAll?.length ?? 0
    },
    totalHeight() {
      return d3.sum(this.vertexList, vertex => vertex.config.height)
    },
    counterKeys() {
      if (Object.values(this.counters).length !== 0) {
        return Object.keys(Object.values(this.counters)[0])
      } else {
        return []
      }

    },
    counterLen() {
      return Object.values(this.counters).length
    }
  }
}
</script>

<style scoped>

</style>
