<template>
    <g>
        <g :transform="'translate(' + [0, 0] + ')'">
            <text class="name1" style="font-size:10px" :y="18">Start/End Time</text>
            <rect style="rx:3; ry:3" :width="u1Width" :height="vHeight" fill="none" :y="marginY"
                   fill-opacity="0.1" stroke="grey"></rect>
            <path :d="startCurve" fill="green" stroke="green" fill-opacity="0.1" stroke-width="0.1"></path>
            <path :d="endCurve" fill="red" stroke="red" fill-opacity="0.1" stroke-width="0.1"></path>
        </g>
        <g :transform="'translate(' + [width / 2 + 1 * marginMiddle, 0] + ')'">
            <text class="name2" style="font-size:10px"
                  :y="18">Duration</text>
            <rect style="rx:3; ry:3" :width="u1Width" :height="vHeight" fill="none" :y="marginY"
                  fill-opacity="0.1" stroke="grey"></rect>
            <path :d="durationCurve" fill="blue" stroke="blue" fill-opacity="0.1" stroke-width="0.1"></path>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"
//
function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
    };
}
function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}


export default {
    name: "VertexView",
    props: ['width', 'height', 'tasks', 'vertexStart', 'vertexEnd', 'maxDuration', 'headConfig'],
    data(){
        let marginMiddle = 2
        let uWidth  = this.width / 2 - marginMiddle
        let marginY = 2
        let vHeight = this.height - 2 * marginY
        let xScale = d3.scaleLinear().domain([this.vertexStart - this.vertexStart, this.vertexEnd - this.vertexStart]).range([10, uWidth - 10])
        let yScale = d3.scaleLinear().domain([0, 1]).range([vHeight, 0])

        return {
            xScale: xScale,
            yScale: yScale,
            startDensity: [],
            endDensity:[],
            u1Width: uWidth,
            durationXScale: d3.scaleLinear(),
            durationYScale: d3.scaleLinear(),
            durationDensity: [],
            marginY: marginY,
            vHeight: vHeight,
            marginMiddle: marginMiddle
        }
    },
    mounted(){

        // this.taskDurationX = this.headLength + this.cellWidth + this.taskCountLength

        const sdKde = kernelDensityEstimator(kernelEpanechnikov(500), this.xScale.ticks(1000))

        const startTasks = this.tasks.map(d=>d.start_time - this.vertexStart)
        const startDensity =  sdKde(startTasks)
        startDensity.splice(0,0, [0,0])
        let lastIndex = startDensity.length - 1
        startDensity.push([startDensity[lastIndex-1][0], 0])
        this.startDensity = startDensity

        const endTasks = this.tasks.map(d=>d.end_time - this.vertexStart)
        const endDensity =  sdKde(endTasks)
        endDensity.splice(0,0, [0,0])
        endDensity.push([endDensity[lastIndex-1][0], 0])
        this.endDensity = endDensity

        this.yScale.domain([0,
            Math.max(d3.max(startDensity, d=>d[1]), d3.max(endDensity, d=>d[1]))])

        this.durationXScale.domain([0, this.maxDuration]).range([10, this.u1Width - 10])
        const durationKde = kernelDensityEstimator(kernelEpanechnikov(100), this.durationXScale.ticks(1000))
        const taskDurations = this.tasks.map(d=>d.end_time - d.start_time)
        const durationDensity =  durationKde(taskDurations)
        durationDensity.splice(0,0, [0,0])
        durationDensity.push([durationDensity[lastIndex-1][0], 0])
        this.durationDensity = durationDensity
        // this.durationXScale.domain([0, d3.max(durationDensity, d=>d[0])]).range([10, this.u1Width - 10])
        this.durationYScale.domain([0, d3.max(durationDensity, d=>d[1])]).range([this.height, 0])


    },
    methods: {},
    computed:{
        startCurve(){
            let line = d3.line()
                .curve(d3.curveBasis)
                .x(d=> this.xScale(d[0]))
                .y(d=>this.yScale(d[1]))
            return line(this.startDensity)
        },
        endCurve(){
            let line = d3.line()
                .curve(d3.curveBasis)
                .x(d=> this.xScale(d[0]))
                .y(d=>this.yScale(d[1]))
            return line(this.endDensity)
        },
        durationCurve(){
            let line = d3.line()
                .curve(d3.curveBasis)
                .x(d=>this.durationXScale(d[0]))
                .y(d=>this.durationYScale(d[1]))
            return line(this.durationDensity)
        }
    }

}
</script>

<style scoped>

</style>