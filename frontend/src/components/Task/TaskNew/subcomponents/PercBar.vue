<template>
    <g>
        <rect :y="(height - barHeight) / 2" :x="0"
              :width="Math.max(width - marginLR, 0)" :height="barHeight" fill="none" stroke="grey" stroke-width="1"
        ></rect>
        <rect :y="(height - barHeight) / 2" :x="0"
              :width="Math.max(width - marginLR, 0) / maxVal * val"
              :height="barHeight" fill="grey" stroke="grey" stroke-width="1"
        ></rect>
        <text class="name" :x="width / 2" :y="textMarginY" style="font-size: 10px">{{showName}}</text>
    </g>
</template>

<script>
import * as d3 from "d3";
export default {
    props: ['height', 'width', 'marginLR', 'barHeight', 'maxVal', 'val', 'showMax'],
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