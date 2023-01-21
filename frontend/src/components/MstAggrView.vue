<template>
  <el-row style="height: 100%; width: 100%">
    <div>
      <el-slider
          v-model="clusterNumber"
          :step="1"
          @change="changeClusterNumber"
          :min="1"
          :max="maxClusterNumber"
          show-stops>
      </el-slider>
    </div>
    <svg style="height: 100%; width: 100%">
      <g v-if="loaded" class="progressContainer">
        <g class="nodeContainer">
          <g v-for="(node, idx) in nodes" v-bind:key="node.id"
             :transform="'translate(' +  [node.data.x0 , node.data.y] + ')'">
            <rect :height="layoutConfig.vertexHeight"
                  :width="node.data.x1 - node.data.x0"
                  :stroke="'grey'" stroke-width="2"
                  :fill="'rgba(69,135,191,0.49)'"
            ></rect>
            <text font-size="10px">{{ texts[idx] }}</text>
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
  import * as d3 from "d3";
  import {mapState} from "vuex";

  const curveGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveBasis)

  export default {
    name: "MstAggrView",
    components: {
    },
    data() {
      return {
        containerWidth: 0,
        containerHeight: 0,
        clusterNumber: 1,
        maxClusterNumber: 1,
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

          this.clusterNumber = this.maxClusterNumber = Math.max(1, this.graph.nodes.length)
        }
      }
    },
    methods: {
      changeClusterNumber(clusterNumber) {
        if (this.loaded) {
          this.$store.commit('simulation/changeClusterNumber', clusterNumber)
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
        layoutConfig: state => state.layoutConfig
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
      }
    }
  }
</script>

<style scoped>

</style>
