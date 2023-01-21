<template>
  <svg>
    <g :transform="'translate(' + [gap,0] + ')'" class="matrixContainer">
      <g class="taskCount">
        <!--          <g v-if="selectionRegion.minStartTime>0">-->
        <!--            &lt;!&ndash;            <text :x="selectionRegion.x1">{{ parseInt(selectionRegion.startTime / 10 ** 9 * 1000) / 1000 }}</text>&ndash;&gt;-->
        <!--            &lt;!&ndash;            <text :x="selectionRegion.x2" :y="size/8">{{ parseInt(selectionRegion.endTime / 10 ** 9 * 1000) / 1000 }}</text>&ndash;&gt;-->
        <!--            <text fill-opacity="0.8" font-size="10" :x="(selectionRegion.x1 + selectionRegion.x2)/2 "-->
        <!--                  :y="size/8 - 5">-->
        <!--              {{ (selectionRegion.endTime - selectionRegion.startTime) / 1000 + 's' }}-->
        <!--            </text>-->
        <!--          </g>-->
        <rect fill="none" stroke="grey" fill-opacity="0.2"
              :width="size" :height="height" stroke-width="0.5"></rect>
        <path :d="taskCount" stroke="darkgrey" fill="grey" fill-opacity="0.1"></path>
      </g>
<!--      <g v-if="timeSelected == true">-->
<!--        <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"-->
<!--              :x1="timeSelectRegion.x1"-->
<!--              :y1="0"-->
<!--              :x2="timeSelectRegion.x1"-->
<!--              :y2="ch ">-->
<!--        </line>-->
<!--        <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"-->
<!--              :x1="timeSelectRegion.x2"-->
<!--              :y1="0"-->
<!--              :x2="timeSelectRegion.x2"-->
<!--              :y2="ch ">-->
<!--        </line>-->

<!--      </g>-->
    </g>
  </svg>
</template>

<script>
  import {mapState} from "vuex";
  import * as d3 from "d3";

  const dLine = d3.line().x(d => d.x).y(d => d.y);

  /**
   * @param {(Task & TaskMatrixVO)[]} tasks
   * @param outputRange
   * @param mXScale
   * @return {*}
   */
  const atomTaskCountLine = function (tasks, outputRange, mXScale) {
    let usage = [];
    let trend = [];
    let count = 0;
    tasks.forEach(task => {
      usage.push({'type': 'start', 'time': task.start});
      usage.push({'type': 'end', 'time': task.end});
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
        if (trend.length === 0) {
          trend.push({'time': u.time, 'count': 0})
        }
        trend.push({'time': u.time, 'count': count})
      }
    })

    let mTYScale = d3.scaleLinear().domain([0, d3.max(trend, u => u.count)]).range(outputRange);
    let _render = [];
    trend.forEach((u, i) => {
      if (i !== 0) {
        _render.push({x: mXScale(u.time), y: mTYScale(trend[i - 1].count)});
      }
      _render.push({x: mXScale(u.time), y: mTYScale(u.count)})
    })
    return dLine(_render);
  }

  export default {
    name: "TaskCount",
    props: ['app', 'tasks', 'width', 'height'],
    data() {
      return {
        gap: 5,
        containerHeight: 0,
        containerWidth: 0,
        xScale: undefined,
        taskCount: "",
        timeSelectRegion: {
          x1: 0,
          x2: 0,
          y1: 0,
          y2: 0
        },
        size: 0,
      }
    },
    components: {},
    mounted() {
      this.containerWidth = this.$el.clientWidth;
      this.containerHeight = this.$el.clientHeight;
      this.size = Math.max(0, this.width - 2 * this.gap);
      this.xScale = d3.scaleLinear().range([0, this.size]);

      // this.svg = d3.select(this.$el).select('svg');
      // const zoom = d3.zoom()
      //     .scaleExtent([-3, 8])
      //     .on('zoom', function () {
      //       d3.select('.matrix').attr('transform', d3.event.transform);
      //     });
      // this.svg.call(zoom);

      this.render();
    },
    methods:{
      render(){
        this.xScale.domain([this.minTime, this.vMaxTime]);
        this.taskCount = atomTaskCountLine(this.tasks, [this.height, 0], this.xScale);
      }
    },
    watch: {
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
      },
      matrixSign() {
        this.render();
      },
    },
    computed: {
      ...mapState('comparison', {}),
      // selectionRegion() {
      //   return this.app.timeSelection
      // },
      matrixSign() {
        return this.app.signs.matrixSign;
      },
      maxTime() {
        return this.app.visDuration
      },
      minTime() {
        return 0
      },
      vMaxTime() {
        return this.app.visDuration
      },
      timeSelected() {
        let _sum = this.selectionRegion.startTime + this.selectionRegion.endTime;

        if (_sum > 0) {
          return true;
        } else {
          return false;
        }
      },
    },
  }
</script>

<style scoped>

</style>
