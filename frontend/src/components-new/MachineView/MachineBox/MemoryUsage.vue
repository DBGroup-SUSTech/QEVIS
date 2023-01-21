<template>
    <svg>
        <g :transform="'translate(' + [gap,0] + ')'" class="matrixContainer">
            <g class="taskCount" >
<!--                <g v-if="selectionRegion.minStartTime>0">-->
<!--                    &lt;!&ndash;            <text :x="selectionRegion.x1">{{ parseInt(selectionRegion.startTime / 10 ** 9 * 1000) / 1000 }}</text>&ndash;&gt;-->
<!--                    &lt;!&ndash;            <text :x="selectionRegion.x2" :y="size/8">{{ parseInt(selectionRegion.endTime / 10 ** 9 * 1000) / 1000 }}</text>&ndash;&gt;-->
<!--                    <text fill-opacity="0.8" font-size="10" :x="(selectionRegion.x1 + selectionRegion.x2)/2 "-->
<!--                          :y="size/8 - 5">-->
<!--                        {{ (selectionRegion.endTime - selectionRegion.startTime) / 1000 + 's' }}-->
<!--                    </text>-->
<!--                </g>-->
                <rect fill="none" stroke="grey" fill-opacity="0.2"
                      :width="size" :height="height" stroke-width="0.5"></rect>

                <path v-for="(line, index) in renderLines" :key="index" :d="line"
                      stroke="darkgrey" fill="#f2f2f2"
                      stroke-width="1"
                ></path>
            </g>
<!--            <g v-if="timeSelected == true">-->
<!--                <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"-->
<!--                      :x1="timeSelectRegion.x1"-->
<!--                      :y1="0"-->
<!--                      :x2="timeSelectRegion.x1"-->
<!--                      :y2="ch ">-->
<!--                </line>-->
<!--                <line style="stroke:purple; stroke-width:1" stroke-dasharray="4"-->
<!--                      :x1="timeSelectRegion.x2"-->
<!--                      :y1="0"-->
<!--                      :x2="timeSelectRegion.x2"-->
<!--                      :y2="ch ">-->
<!--                </line>-->

<!--            </g>-->
        </g>
    </svg>
</template>

<script>
import {mapState} from "vuex";
import * as d3 from "d3";
const dLine = d3.line().x(d => d.x).y(d => d.y);

/**
 * @param {Record[]} records
 * @param outputRange
 * @param mXScale
 * @return {boolean|[]}
 */
const atomMemoryLine = function (records, outputRange, mXScale) {

    let trend = [];
    let lines = [];
    records.forEach(record => {
        trend.push({'values': [record.mem.percent], 'timestamp': record.timestamp});
    })
    // set or compute limit here
    let mTYScale = d3.scaleLinear().domain([0,100]).range(outputRange);
    trend.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1);

    for(let i = 0, ilen = 1; i< ilen; i++){
        let linePara = [];
        linePara.push({x: 0, y: outputRange[0]});
        trend.forEach(tre=>{
            let x = mXScale(tre.timestamp) < 0?0:mXScale(tre.timestamp);
            linePara.push({x: x, y:mTYScale(tre.values[i])})
        });
        if (trend.length > 0) {
            linePara.push({x: mXScale(trend[trend.length - 1].timestamp), y: outputRange[0]});
        }
        lines.push(dLine(linePara))
    }
    return lines
}
export default {
    name: "MemoryUsage",
    props: ['app', 'machine', 'width', 'height'],
    data() {
        return {
            gap: 5,
            containerHeight: 0,
            containerWidth: 0,
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
            size: 0,
        }
    },
    components: {
    },
    mounted() {
        this.containerWidth = this.$el.clientWidth;
        this.containerHeight = this.$el.clientHeight;
        this.size = Math.max(0, this.width - 2 * this.gap);
        this.xScale = d3.scaleLinear().range([0, this.size]);

        this.$nextTick(() => {
            this.render();
        });
    },
    methods:{
      render(){
          this.xScale.domain([this.minTime, this.vMaxTime]);
          const records = this.machine.records.filter(r => r.timestamp <= this.vMaxTime);
          this.renderLines = atomMemoryLine(records, [this.height, 0], this.xScale);
      }
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
        matrixSign() {
            this.render();
        },
    },
    computed: {
        ...mapState('comparison', {}),
        matrixSign() {
            return this.app.signs.matrixSign;
        },
        maxTime() {
            return this.app.visDuration
        },
        minTime() {
            return 0
        },
        vMaxTime() {
            return this.app.visDuration
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

</style>
