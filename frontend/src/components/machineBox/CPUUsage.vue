<template>
    <div>
        <canvas ref="canvas" :width="size - 1" :height="countHeight - 1"/>
        <svg class="svgContainer" style="height: 100%; width: 100%; position: absolute; left:0; top:-2">
            <g :transform="containerTransform" class="matrixContainer">
                <g v-if="loaded">
                    <g class="taskCount" >
                        <g v-if="selectionRegion.minStartTime>0">
                            <!--            <text :x="selectionRegion.x1">{{ parseInt(selectionRegion.startTime / 10 ** 9 * 1000) / 1000 }}</text>-->
                            <!--            <text :x="selectionRegion.x2" :y="size/8">{{ parseInt(selectionRegion.endTime / 10 ** 9 * 1000) / 1000 }}</text>-->
                            <text fill-opacity="0.8" font-size="10" :x="(selectionRegion.x1 + selectionRegion.x2)/2 "
                                  :y="size/8 - 5">
                                {{ (selectionRegion.endTime - selectionRegion.startTime) / 1000 + 's' }}
                            </text>
                        </g>
                        <rect fill="none" stroke="grey" fill-opacity="0.2"
                              :width="size" :height="countHeight" stroke-width="0.5"></rect>
                    </g>
                </g>
                <g v-if="timeSelected == true">
                    <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"
                          :x1="timeSelectRegion.x1"
                          :y1="0"
                          :x2="timeSelectRegion.x1"
                          :y2="ch ">
                    </line>
                    <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"
                          :x1="timeSelectRegion.x2"
                          :y1="0"
                          :x2="timeSelectRegion.x2"
                          :y2="ch ">
                    </line>

                </g>
            </g>
        </svg>
    </div>
</template>

<script>
import {mapState} from "vuex";
import * as d3 from "d3";


const cpuMatrix = function(status, outputRange, mXScale, height){
    if(status.length == 0 || status.length == 1){
        return false
    }
    let _start = status[0].timestamp
    let cpus = [];
    let colorScale = d3.scaleSequential(d3["interpolate" + 'YlOrRd'])
        .domain([0, 100]);
    for(let i = 0, ilen=status.length; i < ilen; i++){
        let startTime = _start;
        let endTime = i == ilen-1?status[i].timestamp:(status[i].timestamp + status[i+1].timestamp) / 2;
        _start = endTime;
        let values = [];
        let uh = height / status[i].perCpuPercent.length;
        // TODO: perCpuPercent => hard code
        status[i].perCpuPercent.forEach((val, i)=>{
            values.push({'value':val,'y':i*uh, 'id':i, fill: colorScale(val)})
        })
        let x = mXScale(startTime);
        let w = Math.max(mXScale(endTime) - x, 0);
        if(x >=0){
            cpus.push({
                x:x,w:w,uh:uh,values: values
            })
        }
    }
    return cpus
}
//
// const atomCPULine = function (status, outputRange, mXScale) {
//
//     let trend = [];
//     let lines = [];
//     status.forEach(statu => {
//         trend.push({'values': statu.perCpuPercent, 'timestamp': statu.timestamp});
//     })
//     let mTYScale = d3.scaleLinear().domain([0,100]).range(outputRange);
//     trend.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1);
//     let lineParas = [];
//     for(let i = 0, ilen = 16; i< ilen; i++){
//         let linePara = [];
//         trend.forEach(tre=>{
//             let x = mXScale(tre.timestamp) < 0?0:mXScale(tre.timestamp);
//             linePara.push({x: x, y:mTYScale(tre.values[i])})
//         })
//         lineParas.push(linePara);
//         lines.push(dLine(linePara))
//     }
//     return lines
// }
export default {
    name: "Task",
    props: ['taskList', 'status', 'id', 'ch', 'width', 'height'],
    data() {
        let ch = 30
        if (this.ch != undefined) {
            ch = this.ch
        }
        return {
            gap: 3,
            containerHeight: 0,
            containerWidth: 0,
            countHeight: ch,
            xScale: undefined,
            taskCount: "",
            yScale: undefined,
            timeSelectRegion: {
                x1: 0,
                x2: 0,
                y1: 0,
                y2: 0
            },
            renderLines:[],
            renderValues: [],
            canvas: null,
            heatmapContext: null,
        }
    },
    components: {
    },
    methods: {
        renderHeatMap () {
            // clean all
            this.heatmapContext.fillStyle = '#ffffff'
            this.heatmapContext.fillRect(0, 0, this.canvas.width, this.canvas.height)

            // use native for to speed up as this place need to run fast
            for (let cIdx = 0, cNum = this.renderValues.length; cIdx < cNum; cIdx++) {
                let cv = this.renderValues[cIdx]
                let rvs = cv.values, x = cv.x, w = cv.w, uh = cv.uh
                for (let rIdx = 0, rNum = rvs.length; rIdx < rNum; rIdx++) {
                    let rv = rvs[rIdx]
                    this.heatmapContext.fillStyle = rv.fill
                    this.heatmapContext.fillRect(x, rv.y, w, uh)
                }
            }
        }
    },
    mounted() {
        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        this.canvas = this.$refs.canvas
        this.heatmapContext = this.canvas.getContext("2d")
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
        renderSign() {
            if (this.xScale == undefined) {
                this.xScale = d3.scaleLinear().domain([this.minTime, this.vMaxTime]).range([0, this.size - 20]);
            }
            if (this.xScale != undefined) {
                this.xScale = d3.scaleLinear().domain([this.minTime, this.vMaxTime]).range([0, this.size - 20]);
            }
            if(this.status){
                this.renderValues = cpuMatrix(this.status, [this.countHeight, 0],
                    this.xScale, this.height - 1);      // -1 for margin
                this.renderHeatMap()     // using renderValues
                // this.renderLines = atomCPULine(this.status, [this.countHeight, 0], this.xScale);
            }

            // this.yScale = d3.scaleLinear().domain([0, 100]).range([this.countHeight, 0]);
        },

        loaded() {
            if (this.loaded == true) {
                this.svg = d3.select(this.$el).select('svg');
                var zoom = d3.zoom()
                    .scaleExtent([-3, 8])
                    .on('zoom', function () {
                        d3.select('.matrix').attr('transform', d3.event.transform);
                    });
                this.svg.call(zoom);
            }
        },

    },
    computed: {
        size(){
            return this.width - 2 * this.gap;
        },
        containerTransform() {
            let dx = this.gap, dy = this.gap / 2;
            if (this.containerWidth > this.containerHeight) {
                dx += (this.containerWidth - this.size) / 2;
            } else {
                dy += 0;
            }
            return 'translate(' + [dx, dy] + ')';
        },
        ...mapState('simulation', {
            selectionRegion: state => state.timeSelection,
            renderSign: state => state.renderSign,
            maxTime: state => state.application.maxTime,
            minTime: state => state.application.minTime,
            vMaxTime: state => state.application.vMaxTime,
        }),
        loaded() {
            if (this.taskList.length == 0) {
                return false
            } else {
                return true
            }
        },
        timeSelected() {
            let _sum = this.selectionRegion.startTime + this.selectionRegion.endTime;

            if (_sum > 0) {
                return true;
            } else {
                return false;
            }
        },
    }
}
</script>

<style scoped>
.svgContainer{
    height: 100%;
    width: 100%;
    position: absolute;
    left:0;
    top:-2

}
</style>
