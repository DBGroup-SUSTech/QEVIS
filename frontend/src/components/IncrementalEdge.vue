<template>
    <g :info="edge.srcVertexName + ' -> ' + edge.dstVertexName">
        <path :d="linePath" fill="none" stroke="rgba(50, 50, 50, 0.5)" stroke-width="1" ></path>
        <path v-if="useLink" :d="circlePath" fill="none" stroke="rgba(50, 50, 50, 0.5)" stroke-width="1"
              :transform="'translate(' + circleTranslate1 + ')'"/>
        <path v-if="useLink" :d="circlePath" fill="none" stroke="rgba(50, 50, 50, 0.5)" stroke-width="1"
              :transform="'translate(' + circleTranslate2 + ')'"/>

        <path v-if="pointTranslate1 != null" :d="pointPath" fill="rgba(50, 50, 50)" stroke-width="0"
              :transform="'translate(' + pointTranslate1 + ')'"/>
        <path v-if="pointTranslate2 != null" :d="pointPath" fill="rgba(50, 50, 50)" stroke-width="0"
              :transform="'translate(' + pointTranslate2 + ')'"/>

<!--        <circle v-if="showCtrl" r="2" :cx="control" :cy="dstY" fill="rgba(50, 50, 50, 0.5)"/>-->
    </g>
</template>

<script>
import * as d3 from "d3"

// const lineGen = d3.line().x(p => p[0]).y(p => p[1])
// const curveGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveBasis)
const circleGen = d3.arc().innerRadius(0).startAngle(0).endAngle(2 * Math.PI)

export default {
    name: "IncrementalEdge",
    props: ['edge'],
    data () {
        return {
            linePath: "",
            useLink: false,     // use bubble link or not
            circleTranslate1: [0, 0],
            circleTranslate2: [0, 0],
            circlePath: circleGen({outerRadius: 2}),

            pointPath: circleGen({outerRadius: 1.2}),
            pointTranslate1: null,
            pointTranslate2: null,

            showCtrl: true,
            control: 0,
            dstY: 0,
        }
    },
    methods: {
        drawAdvancedCurve () {

            // base curve

            let {srcX, srcY, dstX, dstY} = this.pathInfo

            let dx = srcX - dstX; //dy = srcY - dstY;
            let points = [{x: srcX, y: srcY},
                {x: srcX - dx * 2 / 4, y: srcY},
                {x: dstX + dx * 2 / 4, y: dstY},
                {x: dstX, y: dstY}];
            var Gen = d3.line()
                .x((p) => p.x)
                .y((p) => p.y)
                .curve(d3.curveBasis);

            this.linePath = Gen(points)

            // straight line

            // if (this.srcNode.vertexName !== 'Map 4' || this.dstNode.vertexName !== 'Map 12') {
            //     return
            // }

            // let {srcX, srcY, dstX, dstY, ctrl, dstHeight, srcHeight} = this.pathInfo
            // let deltaY = (srcY < dstY) ? 1 : -1
            //
            // this.control = ctrl
            // this.dstY = dstY
            //
            // this.useLink = false
            //
            // if (Math.abs(srcY - dstY) <= srcHeight * 0.2) {
            //     // in same lane
            //     this.linePath = lineGen([[srcX, srcY], [srcX, dstY], [dstX, dstY]])
            //     this.pointTranslate1 = [srcX, srcY]
            //     this.pointTranslate2 = [dstX, dstY]
            //
            // } else if (ctrl <= dstX) {
            //     let dx = dstX - srcX
            //     let dy = dstY - srcY
            //     if (srcX < ctrl - this.gaspPixel * 1.2) {
            //         // S-   C D
            //         // 0 1
            //         //     2
            //         //      3 4
            //         let points = [[srcX, srcY], [ctrl - this.gaspPixel, srcY + deltaY * srcHeight / 4 * (ctrl - srcX) / dx],
            //             [ctrl - this.gaspPixel * 0.7, srcY + dy / 4],
            //             [ctrl - this.gaspPixel * 0.3, dstY - dy / 4], [ctrl, dstY], [dstX, dstY]]
            //         this.linePath = curveGen(points)
            //     } else {
            //         // -S    C D
            //         //  01
            //         //     2 3 4
            //         let points = [[srcX, srcY], [srcX + (ctrl - srcX) / 3, srcY],
            //             [ctrl - (ctrl - srcX) / 4, dstY - dy * 0.3], [ctrl, dstY], [dstX, dstY]]
            //         this.linePath = curveGen(points)
            //     }
            //     this.pointTranslate1 = [srcX, srcY]
            //     this.pointTranslate2 = [dstX, dstY]
            //
            // } else if (srcX <= dstX) {
            //     // S   D C
            //     // 0
            //     //  1
            //     //   2 3
            //     // let points = [[srcX, srcY], [srcX, srcY + deltaY * dstHeight],
            //     //     [srcX, dstY], [dstX, dstY]]
            //     // this.linePath = curveGen(points)
            //     let dx = dstX - srcX
            //     let points = [[srcX, srcY], [srcX + dx / 2, srcY],
            //         [srcX + dx / 2, dstY], [dstX, dstY]]
            //     this.linePath = curveGen(points)
            //     this.pointTranslate1 = [srcX, srcY]
            //     this.pointTranslate2 = [dstX, dstY]
            //
            // } else {
            //     let dstEndX = dstX + this.dstNode.layout.width
            //     let dstY2 = dstY + (-deltaY) * dstHeight / 2        // contrary direction
            //
            //     if (ctrl <= dstEndX) {
            //         let dy = dstY2 - srcY
            //         if (srcX < ctrl - this.gaspPixel * 1.2) {
            //             // S-     C
            //             // 0 1
            //             //     2
            //             //      3 4
            //             let points = [[srcX, srcY], [ctrl - this.gaspPixel * 1.2, srcY],
            //                 [ctrl - this.gaspPixel * 0.9, srcY + dy / 4],
            //                 [ctrl - this.gaspPixel * 0.6, dstY2 - dy / 4],
            //                 [ctrl - this.gaspPixel * 0.2, dstY2], [ctrl, dstY2]]
            //             this.linePath = curveGen(points)
            //         } else {
            //             // -S    C
            //             //  01
            //             //     2 3
            //             let points = [[srcX, srcY], [srcX + (ctrl - srcX) / 2, srcY],
            //                 [ctrl - (ctrl - srcX) / 2, dstY2], [ctrl, dstY2]]
            //             this.linePath = curveGen(points)
            //         }
            //
            //         this.pointTranslate1 = [srcX, srcY]
            //         this.pointTranslate2 = [ctrl, dstY2]
            //
            //     } else if (srcX <= dstEndX - this.gaspPixel / 4) {
            //         // srcX <= dstEndX - gasp / 3 < dstEndX < ctrl
            //         // 0
            //         //  1 2
            //         let dstX2 = srcX + this.gaspPixel / 4
            //         let points = [[srcX, srcY],
            //             [srcX + this.gaspPixel / 6, dstY2], [dstX2, dstY2]]
            //         this.linePath = curveGen(points)
            //
            //         this.pointTranslate1 = [srcX, srcY]
            //         this.pointTranslate2 = [dstX2, dstY2]
            //
            //     } else {
            //         // srcX > dstEndX - gasp / 3
            //         // use bubble
            //
            //         // points1  points2
            //         // 0        0 1
            //         // 1 2        2
            //         let points1 = [[srcX, srcY], [srcX, srcY + srcHeight / 2],
            //             [srcX + this.gaspPixel / 3, srcY + srcHeight / 2]]
            //         let points2 = [[dstX - this.gaspPixel / 3, dstY - dstHeight / 2],
            //             [dstX, dstY - dstHeight / 2], [dstX, dstY]]
            //         this.linePath = curveGen(points1) + " " + curveGen(points2)
            //         this.useLink = true
            //         this.circleTranslate1 = [points1[2][0] + 2, points1[2][1]]
            //         this.circleTranslate2 = [points2[0][0] - 2, points2[0][1]]
            //         this.pointTranslate1 = null
            //         this.pointTranslate2 = null
            //     }
            // }

        },
    },
    watch:{
        srcNode(newNode,oldNode){
            console.log('newNode', newNode,oldNode)
        },
        pathInfo(newVal) {
            if (newVal !== null) {
                this.drawAdvancedCurve()
            }
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
        gaspPixel () {
            return this.$store.state.simulation.gaspPixel
        },
        pathInfo () {
            if (this.dstNode != null && this.srcNode != null) {
                let srcX = this.srcNode.layout.x + this.srcNode.layout.width,
                    srcY = this.srcNode.layout.y + this.srcNode.layout.height / 2,
                    dstX = this.dstNode.layout.x,
                    dstY = this.dstNode.layout.y + this.dstNode.layout.height / 2;

                let ctrl = this.edge.layout.ctrl
                let srcHeight = this.srcNode.layout.height,
                    dstHeight = this.dstNode.layout.height

                return {srcX, srcY, dstX, dstY, ctrl, srcHeight, dstHeight}

            } else {
                return null
            }
        },
    }
}
</script>

<style scoped>

</style>
