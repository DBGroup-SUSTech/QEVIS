<template>
  <div class="container">
    <svg/>
  </div>
</template>

<script>
  import * as d3 from "d3"
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
        // let nodes = [
        //   {id: 0, start: 0, end: 3},
        //   {id: 1, start: 2, end: 4},
        //   {id: 2, start: 5, end: 6},
        // ]
        // let edges = [
        //   {v: 0, w: 2},
        //   {v: 1, w: 2},
        // ]

        let nodes = [
          {id: 0, start: 0, end: 2},
          {id: 1, start: 1, end: 8},
          {id: 2, start: 4, end: 12},
          {id: 3, start: 5, end: 13},
          {id: 4, start: 11, end: 15},
          {id: 5, start: 16, end: 19},
        ]
        let edges = [
          {v: 0, w: 3},
          {v: 1, w: 4},
          {v: 2, w: 4},
          {v: 3, w: 5},
          {v: 4, w: 5},
        ]

        // Create the input graph
        let g = new dagre.graphlib.Graph({compound: true})
          .setGraph({})
          .setDefaultEdgeLabel(function () {
            return {};
          });

        g.graph().rankDir = 'LR'

        // update nodes and edges

        nodes.forEach(n => {
          n.gNodes = []
          n.outEdges = []
          n.inEdges = []
        })
        edges.forEach(e => {
          let src = nodes[e.v], dst = nodes[e.w]
          src.outEdges.push(e)
          dst.inEdges.push(e)
        })

        // compute gNodes and gEdges

        let gNodes = []
        let gEdges = []

        let processMap = new Map()
        let process = []
        nodes.forEach(n => {
          process.push({node: n, time: n.start})
          process.push({node: n, time: n.end})
        })
        process.sort((a, b) => a.time - b.time)

        let cnt = 0
        process.forEach((p, i) => {
          let justAdd = false
          if (!processMap.has(p.node.id)) {
            justAdd = true
            processMap.set(p.node.id, p.node)
          }
          for (let id of processMap.keys()) {
            let node = nodes[id]
            let gNode = {id: cnt++, time: p.time, node: node,
              outGEdges: [], inGEdges: []}
            node.gNodes.push(gNode)
            gNodes.push(gNode)
          }
          if (!justAdd && processMap.has(p.node.id)) {
            processMap.delete(p.node.id)
          }
        })

        // gEdges ...
        cnt = 0
        nodes.filter(n => n.inEdges.length === 0).forEach(n => {
          let dumbNode = {id: gNodes.length, time: -1, node: null,
            outGEdges:[], inGEdges:[]}
          gNodes.push(dumbNode)
          let src = dumbNode, dst = n.gNodes[0]
          let gEdge = {id: cnt++, v: src, w: dst}
          src.outGEdges.push(gEdge)
          dst.inGEdges.push(gEdge)
          gEdges.push(gEdge)
        })
        edges.forEach(e => {
          let vGNodes = nodes[e.v].gNodes,
              wGNodes = nodes[e.w].gNodes
          let wGNodeIdx = 0
          let src = vGNodes[vGNodes.length-1], dst = wGNodes[wGNodeIdx]
          while (dst.time <= src.time) {
            dst = wGNodes[++wGNodeIdx]
          }
          let gEdge = {id: cnt++, v: src, w: dst}
          src.outGEdges.push(gEdge)
          dst.inGEdges.push(gEdge)
          gEdges.push(gEdge)
        })
        nodes.forEach(n => {
          for (let i = 0; i < n.gNodes.length - 1; ++i) {
            let src = n.gNodes[i], dst = n.gNodes[i+1]
            let gEdge = {id: cnt++, v: src, w: dst}
            src.outGEdges.push(gEdge)
            dst.inGEdges.push(gEdge)
            gEdges.push(gEdge)
          }
        })

        console.log(gNodes, gEdges)

        g.graph().rankDir = 'LR';
        g.graph().align = 'UL';
        g.graph().nodesep = '10';
        g.graph().edgesep = '10';
        g.graph().ranksep = '30';
        g.graph().marginy = '10';
        g.graph().marginx = '10';

        gNodes.forEach(node => {
          node.height = 100
          node.width = 10
          g.setNode(node.id, node);
        })

        nodes.forEach(node => {
          g.setNode('node'+node.id, {label: node.id})
        })

        nodes.forEach(node => {
          node.gNodes.forEach(gNode => {
            g.setParent(gNode.id, 'node'+node.id)
          })
        })

        gEdges.forEach(edge => {
          console.log(edge)
          let minLen = edge.w.time - edge.v.time
          g.setEdge(edge.v.id, edge.w.id, {minLen: minLen});
        });

        dagre.layout(g);

// Set up an SVG group so that we can translate the final graph.
        let svg = d3.select(".container").select('svg')
          .attr('height', 800).attr('width', 1200)
        let svgGroup = svg.append("g");

        let gs = svgGroup.selectAll('g').data(gNodes).enter().append('g')

        gs.append('rect')
          .attr('transform', d => 'translate(' + [d.x, d.y] + ')')
          .attr('height', 80).attr('width', 10)

        gs.append('text').text(d => d.id)
          .attr('x', d => d.x)
          .attr('y', d => d.y)

        let edgeGrp = svgGroup.append('g')
        let lineGen = d3.line().x(p => p.x).y(p => p.y).curve(d3.curveBasis)
        edgeGrp.selectAll('g').data(gEdges).enter().append('path')
          .attr('d', e => lineGen(g.edge({v: e.v.id, w: e.w.id}).points))
          .attr('stroke-width', 1)
          .attr('stroke', 'grey')
          .attr('fill', 'none')
        edgeGrp.attr('transform', 'translate(' + [5, 40] + ')')

// Center the graph
        var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
        svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
        svg.attr("height", g.graph().height + 40);

        let nodeGrp = svgGroup.append('g')
        nodeGrp.selectAll('g').data(nodes).enter().append('rect')
          .attr('x', node => node.gNodes[0].x)
          .attr('y', node => node.gNodes[0].y)
          .attr('width', node => {
            return node.gNodes[node.gNodes.length-1].x - node.gNodes[0].x + 10
          })
          .attr('height', 80)
          .attr('fill', 'rgba(255,117,117,0.2)')

        // nodeGrp = svgGroup.append('g')
        // nodeGrp.selectAll('g').data(nodes.map(n => g.node('node' + n.id))).enter().append('rect')
        //   .attr('x', node => node.x)
        //   .attr('y', node => node.y)
        //   .attr('width', node => node.width)
        //   .attr('height', node => node.height)
        //   .attr('fill', 'rgba(117,200,255,0.2)')
        //
        // nodes.forEach(node => {
        //   console.log(g.node('node' + node.id))
        // })
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
