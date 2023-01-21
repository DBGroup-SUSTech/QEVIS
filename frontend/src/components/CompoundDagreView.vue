<template>
  <el-row style="height: 100%; width: 100%">
    <svg style="height: 100%; width: 100%">
      <g v-if="loaded" class="progressContainer">
        <g class="nodeContainer">
          <g v-for="(cNode, idx) in cNodes" v-bind:key="cNode.id"
             :transform="'translate(' +  [cNode.layout.x , cNode.layout.y] + ')'">
            <rect :height="cNode.layout.height"
                  :width="cNode.layout.width"
                  :stroke="'grey'" stroke-width="2"
                  :fill="'rgba(69,135,191,0.49)'"
            ></rect>
            <text font-size="10px">{{ texts[idx] }}</text>
          </g>
        </g>
        <g class="edgeContainer">
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
  import * as d3 from "d3";
  import {mapState} from "vuex";

  const curveGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveBasis)

  export default {
    name: "CompoundDagreView",
    components: {
    },
    data() {
      return {
        containerWidth: 0,
        containerHeight: 0,
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
        }
      }
    },
    methods: {
    },
    computed: {
      loaded() {
        return !!this.cGraph
      },
      ...mapState('simulation', {
        colorSchema: state => state.colorSchema,
        cGraph: state => state.compoundGraph,
      }),
      cNodes() {
        return this.cGraph ? this.cGraph.nodes : []
      },
      cEdges() {
        return this.cGraph ? this.cGraph.edges : []
      },
      texts() {
        return this.cNodes.map(cNode => {
          let text = ''
          cNode.nodes.forEach(nodeName => {
            let group = nodeName.match(/([A-Z]).*\s(\d*)/)
            text += group[1] + group[2] + ' '
          })
          return text
        })
      },
      paths() {
        // return this.cEdges.map(e => {
        //   let [p, q] = e.getStartEndPoints()
        //   let points = [
        //     [p.x, p.y],
        //     [(p.x + q.x) / 2, p.y],
        //     [(p.x + q.x) / 2, q.y],
        //     [q.x, q.y]
        //   ]
        //   return curveGen(points)
        // })

        return this.cEdges.map(e => {
          let points = e.points.map(p => [p.x, p.y])
          points.sort((p1, p2) => p1[0] - p2[0])

          let [p, q] = e.getStartEndPoints()
          let xScale = d3.scaleLinear()
            .domain(d3.extent(points, p => p[0]))
            .range([p.x, Math.max(p.x, q.x)])
          let yScale = d3.scaleLinear()
            .domain(d3.extent(points, p => p[1]))
            .range([p.y, q.y])
          points.forEach(p => {
            p[0] = xScale(p[0])
            p[1] = yScale(p[1])
          })

          return curveGen(points)
        })
      }
    }
  }
</script>

<style scoped>

</style>
