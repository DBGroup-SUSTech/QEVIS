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
                      :stroke="['red' ,'blue', 'green'][index]" fill="none"
                      stroke-opacity='0.5' stroke-width="1"
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
 * @return {*}
 */
const atomDiskLine = function (records, outputRange, mXScale) {

    let trend = [];
    let lines = [];
    let keys = [];

    // ['red' ,'blue', 'green']
    keys = ["rAwait", "wAwait", "aquSz"];
    if(records.length<=0){
        return []
    }
    let diskName = undefined;
    if(records[0].io.sda !== undefined){
        diskName = 'sda'
    }
    if(records[0].io.sdb !== undefined) {
        diskName = 'sdb'
    }
    if(diskName === undefined){
        console.log('diskName----------', Object.keys(records[0].io))
    }
    let yScaleMap = {};
    keys.forEach(key=>{
        let maxKeyVal = d3.max(records, record=>{
            return record.io[diskName][key];
        });

        let minKeyVal = d3.min(records, record=>{
            return record.io[diskName][key];
        });
        // console.log('id-=', key, minKeyVal, maxKeyVal)
        // minKeyVal = 0
        yScaleMap[key] = d3.scaleLinear().domain([minKeyVal, maxKeyVal]).range(outputRange)
    })

    records.forEach(record => {
        let kvs = [];
        keys.forEach(key=>{
            kvs.push({value: record.io[diskName][key],y:yScaleMap[key](record.io[diskName][key]), id:key})
        })
        trend.push({'values': kvs, 'timestamp': record.timestamp, x:mXScale(record.timestamp)});
    })

    trend.sort((a, b) => (a.timestamp > b.timestamp) ? 1 : -1);

    for(let i=0, ilen=keys.length; i<ilen; i++){
        let linePara = [];
        trend.forEach(tre=>{
            let x = tre.x
            if(x <0) return
            linePara.push({x: x, y:yScaleMap[keys[i]](tre.values[i].value)})
        })
        lines.push(dLine(linePara))

    }
    return lines
}
export default {
    name: "DiskIO",
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

        this.render();
    },
    methods:{
        render(){
            this.xScale.domain([this.minTime, this.vMaxTime]);
            const records = this.machine.records.filter(r => r.timestamp <= this.vMaxTime)
            this.renderLines = atomDiskLine(records, [this.height, 5], this.xScale);
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
        // selectionRegion() {
        //   return this.app.timeSelection
        // },
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
