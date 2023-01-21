<template>
<!--    <path :d="path" fill="none" stroke="grey" :stroke-width="1" stroke-dasharray="3,1"></path>-->
    <path :d="path" fill="none" stroke="grey" :stroke-width="strokeWidth"></path>
</template>

<script>
import * as d3 from "d3"
import {HighlightMode} from "@/utils/const/HightlightMode";

export default {
    name: "DagLink",
    props: ['edge'],
    data() {
        return {}
    },
    computed: {
        // path() {
        //     let srcX = this.edge.srcNode.x + this.edge.srcNode.width,
        //         srcY = this.edge.srcNode.y + this.edge.srcNode.height / 2,
        //         dstX = this.edge.dstNode.x,
        //         dstY = this.edge.dstNode.y + this.edge.dstNode.height / 2;
        //
        //     let dx = srcX - dstX; //dy = srcY - dstY;
        //     let points = [{x: srcX, y: srcY},
        //         {x: srcX - dx * 2 / 4, y: srcY},
        //         {x: dstX + dx * 2 / 4, y: dstY},
        //         {x: dstX, y: dstY}];
        //
        //     // let srcX = this.edge.srcNode.x + this.edge.srcNode.width / 2,
        //     //         srcY = this.edge.srcNode.y + this.edge.srcNode.height,
        //     //         dstX = this.edge.dstNode.x + this.edge.dstNode.width / 2,
        //     //         dstY = this.edge.dstNode.y;
        //     // let dy = dstY - srcY;
        //     // let points = [{x: srcX, y: srcY},
        //     //     {x: srcX, y: srcY + dy * 2 / 4},
        //     //     {x: dstX, y: dstY - dy * 2 / 4},
        //     //     {x: dstX, y: dstY}];
        //     //
        //
        //     var Gen = d3.line()
        //             .x((p) => p.x)
        //             .y((p) => p.y)
        //             .curve(d3.curveBasis);
        //     return Gen(points)
        // },
        path() {
            const src = this.edge.src._dagViewObj;
            const dst = this.edge.dst._dagViewObj;
            let startPoint = {x: src.x + src.width/2, y: src.y}
            let endPoint = {x: dst.x - dst.width/2, y: dst.y}
            let points = [...this.edge.points]
            points[0] = startPoint
            points[points.length-1] = endPoint

            var Gen = d3.line()
                .x((p) => p.x)
                .y((p) => p.y)
                .curve(d3.curveBasis)
            return Gen(points)
        },
        strokeWidth() {
            if (this.edge.src.interact.highlightMode !== HighlightMode.NONE
                    && this.edge.dst.interact.highlightMode !== HighlightMode.NONE) {
                return 3;
            }
            return 1;
        }
    }
}
</script>

<style scoped>

</style>
