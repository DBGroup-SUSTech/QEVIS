<template>
    <path :d="path" fill="none" stroke="grey" stroke-width="1" ></path>
</template>

<script>
import * as d3 from "d3"

export default {
    name: "ScatterEdge",
    props: ['edge', 'vertexLayoutMap'],
    mounted() {},
    watch:{
       srcNode(newNode,oldNode){
          console.log('newNode', newNode,oldNode)
       }
    },
    computed: {
        srcNode() {
            if (this.vertexMap[this.edge.srcVertexName]) {
                return this.vertexMap[this.edge.srcVertexName]
            }
            return null
        },
        dstNode() {
            if (this.vertexMap[this.edge.dstVertexName]) {
                return this.vertexMap[this.edge.dstVertexName]
            }
            return null
        },
        vertexMap() {
            return this.$store.state.simulation.vertexMap
        },
        path() {
            if (this.dstNode == null || this.srcNode == null) {
                return ""
            }

            let srcLayout = this.vertexLayoutMap[this.srcNode.vertexName],
                dstLayout = this.vertexLayoutMap[this.dstNode.vertexName]

            let srcX = srcLayout.x, srcY = srcLayout.y,
                dstX = dstLayout.x, dstY = dstLayout.y

            let dx = srcX - dstX,
                dy = srcY - dstY;
            let points = [{x: srcX, y: srcY},
                {x: srcX, y: srcY - 0.5 * dy},
                {x: dstX + 0.5 * dx, y: dstY + 0.2 * dy},
                {x: dstX, y: dstY}];
            var Gen = d3.line()
                .x((p) => p.x)
                .y((p) => p.y)
                .curve(d3.curveBasis);
            return Gen(points)
        }
    }
}
</script>

<style scoped>

</style>
