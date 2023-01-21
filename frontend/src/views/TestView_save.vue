<template>
  <div class="container">
    <svg/>
  </div>
</template>

<script>
  // import * as d3 from "d3"
  import dagre from "dagre"

  export default {
    name: 'TestView',
    components: {},
    data() {
      return {
        dataName: null,
      }
    },
    created() {
    },
    mounted() {
      this.createDAG()
    },
    /* eslint-disable */
    methods: {
      createDAG() {
        // Create the input graph
        let g = new dagre.graphlib.Graph()
          .setGraph({})
          .setDefaultEdgeLabel(function () {
            return {};
          });

        g.graph().rankDir = 'LR'

        let nodes = [
          // {label: 'a', time: 0, nodes:[]},
          // {label: 'b', time: 2, nodes:[]},
          // {label: 'c', time: 1, nodes:[]},
          // {label: 'd', time: 4, nodes:[]},
          // {label: 'e', time: 5, nodes:[]},
          // {label: 'f', time: 8, nodes:[]},
          // {label: 'g', time: 11, nodes:[]},
          // {label: 'h', time: 12, nodes:[]},
          // {label: 'i', time: 13, nodes:[]},
          // {label: 'j', time: 15, nodes:[]},
          // {label: 'k', time: 16, nodes:[]},
          // {label: 'l', time: 19, nodes:[]},
          {idx: 0, start: 0, end: 2},
          {idx: 1, start: 5, end: 13},
          {idx: 2, start: 1, end: 8},
          {idx: 3, start: 11, end: 15},
          {idx: 4, start: 4, end: 12},
          {idx: 5, start: 16, end: 19},
        ]
        let edges = [
          {v: 0, w: 1},
          {v: 1, w: 5},
          {v: 2, w: 3},
          {v: 3, w: 5},
          {v: 4, w: 3},
        ]
        edges.forEach(e => {
          e.minlen = nodes[e.w].start - nodes[e.v].end
        })
        let processMap = new Map()
        let process = []
        nodes.forEach(n => {
          process.push({type: 'in', node: n, time: n.start})
          process.push({type: 'out', node: n, time: n.end})
        })
        process.sort((a, b) => a.time - b.time)

        process.forEach(p => {
          if (p.type === 'in') {
            processMap.push()
          }
        })

        g.nodes().forEach(function (v) {
          let node = g.node(v);
          // Round the corners of the nodes
          node.rx = node.ry = 5;
        });

// Set up edges, no special attributes.
        g.setEdge(3, 4);
        g.setEdge(2, 3);
        g.setEdge(1, 2);
        g.setEdge(6, 7);
        g.setEdge(5, 6);
        g.setEdge(9, 10);
        g.setEdge(8, 9);
        g.setEdge(11, 12);
        g.setEdge(8, 11);
        g.setEdge(5, 8);
        g.setEdge(1, 5);
        g.setEdge(13, 14);
        g.setEdge(1, 13);
        g.setEdge(0, 1)

// // Create the renderer
//         let render = new dagre.render();
//
// // Set up an SVG group so that we can translate the final graph.
//         let svg = d3.select(".container").select('svg')
//           .attr('height', 800).attr('width', 600)
//         let svgGroup = svg.append("g");
//
//         console.log(svg.node())
//         console.log(svgGroup)
//         console.log(data)
//
// // Run the renderer. This is what draws the final graph.
//         render(svgGroup, g);

// Center the graph
//         var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
//         svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
//         svg.attr("height", g.graph().height + 40);
      }
    },
    watch: {},
    computed: {}
  }
</script>

<style>
  .container {
    width: 100%;
    height: 100%;
  }

  g.type-TK > rect {
    fill: #00ffd0;
  }

  text {
    font-weight: 300;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-size: 14px;
  }

  .node rect {
    stroke: #999;
    fill: #fff;
    stroke-width: 1.5px;
  }

  .edgePath path {
    stroke: #333;
    stroke-width: 1.5px;
  }
</style>
