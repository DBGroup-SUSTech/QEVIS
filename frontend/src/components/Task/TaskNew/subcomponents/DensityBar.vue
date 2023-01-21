<template>
    <g>
        <rect :y="(height - barHeight) / 2" :x="0"
              :width="width" :height="barHeight" fill="none" stroke="grey" stroke-width="1"
        ></rect>
        <g v-if="dataList != undefined">
            <line  v-for="(v, i) in dataList" :key="i" :x1="tScale(v)" :x2="tScale(v)" width="1"
                   :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" stroke="grey" stroke-opacity="0.3"
            > </line>
        </g>
        <line v-if="val != undefined" :x1="tScale(val)" :x2="tScale(val)" width="1"
              :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" stroke="red"
        > </line>
        <text class="name" :x="width / 2" :y="textMarginY" style="font-size: 10px">{{showName}}</text>
    </g>
</template>

<script>
import * as d3 from "d3";
export default {
    props: ['height', 'width', 'marginLR', 'barHeight', 'dataList', 'val', 'tScale'],
    name: "PercBar",
    data(){
        return {
            textMarginY: 0
        }
    },
    mounted(){
        this.textMarginY = (this.height + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
    },
    computed: {
        showName() {
            if(this.showMax === true){
                return this.val + '/' + this.maxVal
            }else{
                return this.val
            }
        }
    }

}
</script>

<style scoped>

</style>