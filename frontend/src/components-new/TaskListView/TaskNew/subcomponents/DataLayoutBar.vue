<template>
  <g @click="clickBar">
    <rect :y="(height - barHeight) / 2" :x="0"
          :width="width" :height="barHeight" fill="none" stroke="grey" stroke-width="1"
    ></rect>
    <g v-if="dataList != undefined">
<!--      rect-->
<!--      <rect v-for="(v, i) in dataListSum" :key="i" :x="tScale(flags[i])" :y="(height - barHeight) / 2"-->
<!--            :width = "tScale(v) - tScale(flags[i])" :height = "barHeight"-->
<!--            :fill="i % 2 === 1? '#1f78b4' : '#a6cee3'"></rect>-->
<!--        <rect  :x="tScale(dataListSum[dataListSum.length - 1])" :y="(height - barHeight) / 2"-->
<!--                  :width = "width - tScale(dataListSum[dataListSum.length - 1])" :height = "barHeight"-->
<!--                  fill="#d9d9d9"></rect>-->
<!--        <line  :x1="tScale(0)" :x2="tScale(0)" width="1"-->
<!--               :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" stroke="black" stroke-width="2" stroke-opacity="0.8"-->
<!--        > </line>-->
<!--      <line  v-for="(v, i) in dataListSum" :key="i+0.5" :x1="tScale(v)" :x2="tScale(v)" width="1"-->
<!--             :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" stroke="black" stroke-width="2" stroke-opacity="0.8"-->
<!--      > </line>-->

<!--      line-->
      <g v-for="(v, i) in dataListSum" :key="i">
        <rect :x="tScale(flags[i])" :y="(height - barHeight) / 2"
              :width = "tScale(v) - tScale(flags[i])" :height = "barHeight"
              :fill="'#e7e7e7'">
          <title>{{ dataMachines[i] }} </title>
        </rect>
        <text :x="(tScale(flags[i]) + tScale(v)) / 2" :y="(1.9 * height/3)"
              style="font-size: 9px; text-anchor: middle; user-select: none;">
          {{ shownText(dataMachines[i], tScale(v) - tScale(flags[i])) }}
          <title>{{ dataMachines[i] }} </title>
        </text>
        <line :x1="tScale(v)" :x2="tScale(v)"
              :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2"
              stroke="black" stroke-width="2" stroke-opacity="0.8"> </line>
      </g>
    </g>
    <circle v-if="isTaskLevel" :r="barHeight/3" :cx="width - 8" :cy="(height) / 2" fill="red" stroke="black" stroke-width="1"></circle>
    <line v-if="val != undefined" :x1="tScale(val)" :x2="tScale(val)" width="2"
          :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" stroke="black"
    > </line>
    <text class="name" :x="width * 0.9" :y="textMarginY"
          style="font-size: 10px; text-anchor: end; user-select: none;">{{showName}}</text>
  </g>
</template>

<script>
import * as d3 from "d3";
import {getSvgTextSize} from "@/utils/utils/LayoutUtils"
export default {
  props: ['height', 'width', 'marginLR', 'barHeight', 'dataList', 'val', 'tScale', 'isTaskLevel'],
  name: "DataLayoutBar",
  data(){
    return {
      textMarginY: 0,
      dataListSum: [],
      dataMachines:[],
      flags: []
    }
  },
  mounted(){
    let dataListSum = this.dataListSum
    // let machines = ['dbg02', 'dbg03', 'dbg04', 'dbg05', 'dbg06', 'dbg07', 'dbg08', 'dbg09', 'dbg10', 'dbg11','dbg12', 'dbg13', 'dbg14', 'dbg15']
    let flag = 0
    let machines = Object.keys(this.dataList)
    machines.sort()
    this.dataMachines = machines

    machines.forEach( m => {
      dataListSum.push(this.dataList[m]+ flag)
      this.flags.push(flag)
      flag += this.dataList[m]
    })
    console.log(this.dataList, this.dataMachines)
    this.textMarginY = (this.height + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
  },
  methods: {
    shownText(text, width) {
      const textWidth = getSvgTextSize(text, '9px', '"Helvetica Neue", Helvetica, Arial, sans-serif').width
      if (textWidth <= width * 1.1) {
        return text
      }

      const collapseWidth = getSvgTextSize('...', '9px', '"Helvetica Neue", Helvetica, Arial, sans-serif').width
      if (collapseWidth <= width * 1.1) {
        return '...'
      }

      return ''
    },
    clickBar() {
      console.log(this.dataList)
    }
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
