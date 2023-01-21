<template>
    <div style="height: 100%; width: 100%">
        <svg style="height: 100%; width: 100%">
            <g :transform="'translate(' + [this.layoutConfig.marginLeft, this.layoutConfig.marginTop] + ')'">
                <g class="nodeContainer">
                    <g v-for="vertex in vertexes" v-bind:key="vertex.vertexName"
                       :transform="'translate(' + getTranslateList(vertex.vertexName) + ')'">
                        <circle r="4" stroke="black"/>
                        <text font-size="10px" dx="4" dy="-4">{{ vertex.vertexName }}</text>
                    </g>
                </g>
                <g class="edgeContainer">
                    <ScatterEdge v-for="edge in renderEdges" :edge="edge"
                                 :vertexLayoutMap="vertexLayoutMap" :key="edge.idx"/>
                </g>
                <g class="axisContainer">
                </g>
                <g class="diagonal">
                    <line></line>
                </g>
            </g>
        </svg>
    </div>
</template>

<script>
    import * as d3 from "d3";
    import ScatterEdge from "@/components/ScatterView/ScatterEdge";

    export default {
    name: "ScatterView",
    components: {
        ScatterEdge,
    },
    data () {
        return {
            xScale: null,
            yScale: null,
            vertexLayoutMap: {},
            visualMaxStartTime: null,
            layoutConfig: {},
        }
    },
    methods: {
        loadLayoutConfig () {
            this.layoutConfig = {
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
                width: 800,
                height: 400,
            }
        },
        updateAxis () {

        },
        updateDiagonal () {
            // already transformed by LayoutConfig
            let maxTime = Math.max(this.visualMaxStartTime, this.maxEndTime)
            d3.select(this.$el).select('.diagonal').select('line')
                .attr('x2', this.xScale(maxTime))
                .attr('y2', this.yScale(maxTime))
        },
        initData () {
            // set range for scales
            this.xScale = d3.scaleLinear()
                .range([this.layoutConfig.marginLeft, this.layoutConfig.width - this.layoutConfig.marginRight])
            this.yScale = d3.scaleLinear()
                .range([this.layoutConfig.marginTop, this.layoutConfig.height - this.layoutConfig.marginBottom])
            // refresh all params
            this.vertexLayoutMap = {}
        },
        // x (end time) : continuously update, y (start time) : discretely update
        updateScales () {
            // for x
            this.xScale.domain([this.minEndTime, this.maxEndTime])
            // for y
            // process visual max start time first
            if (!this.visualMaxStartTime || this.visualMaxStartTime <= this.maxStartTime) {
                this.visualMaxStartTime = (this.maxStartTime - this.minStartTime) * 1.2 + this.minStartTime
            }
            this.yScale.domain([this.minStartTime, this.visualMaxStartTime])
        },
        updateVertexLayoutMap () {
            let layoutMap = {}
            this.vertexes.forEach(vertex => {
                layoutMap[vertex.vertexName] = {
                    x: this.xScale(vertex.endTime),
                    y: this.yScale(vertex.startTime),
                }
            })
            this.vertexLayoutMap = layoutMap        // change here to do the animation ??
        },

        /* help func */

        getTranslateList (vertexName) {
            let vertexLayout = this.vertexLayoutMap[vertexName]
            return [vertexLayout.x, vertexLayout.y]
        },
    },
    created () {
        this.loadLayoutConfig()
        this.initData()
    },
    mounted () {
        let xAxis = d3.axisTop().scale(this.xScale)
        let yAxis = d3.axisLeft().scale(this.yScale)
        let svg = d3.select(this.$el).select('svg').select('.axisContainer')
        svg.append("g").attr("class", "axis")
            // .attr("transform", "translate(" + [this.LayoutConfig.left, this.LayoutConfig.top] + ")")
            .call(xAxis)
        svg.append("g").attr("class", "axis")
            // .attr("transform", "translate(" + [this.LayoutConfig.left, this.LayoutConfig.top] + ")")
            .call(yAxis)
    },
    watch: {
        vertexes () {
            this.updateScales()
            this.updateVertexLayoutMap()
            this.updateDiagonal()
            this.updateAxis()
            console.log("vtx layout map: %o", this.vertexLayoutMap)
            console.log("bounds: %d, %d, %d, %d",
                this.minStartTime, this.maxStartTime, this.minEndTime, this.maxEndTime)
        }
    },
    computed: {
        minStartTime () {
            return d3.min(this.vertexes, vertex => vertex.startTime)
        },
        maxStartTime () {
            return d3.max(this.vertexes, vertex => vertex.startTime)
        },
        minEndTime () {
            return d3.min(this.vertexes, vertex => vertex.endTime)
        },
        maxEndTime () {
            return d3.max(this.vertexes, vertex => vertex.endTime)
        },
        vertexes(){
            return this.$store.state.simulation.vertexes;
        },
        renderEdges(){
            return this.$store.state.simulation.renderEdges;
        }
    }
}
</script>

<style scoped>
.diagonal > line {
    stroke: rgb(99, 99, 99);
    stroke-width: 2;
}
</style>
