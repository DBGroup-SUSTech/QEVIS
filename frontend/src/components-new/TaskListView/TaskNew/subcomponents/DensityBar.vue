<template>
    <g>
        <rect :y="(height - barHeight) / 2" :x="0"
              :width="width" :height="barHeight" fill="none" stroke="grey" stroke-width="1"
        ></rect>
        <g v-if="initDone && dataList !== undefined">
          <g v-if="colorList === undefined" id="lineCanvas">
            <line  :x1="tScale(dataList[0])" :x2="tScale(dataList[0])" width="1"
                   :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" :stroke="strokeColor" stroke-width="2" stroke-opacity="0.15"
            > </line>
          </g>
          <g v-else>
<!--            <line v-for="(v, i) in dataList" :key="i" :x1="tScale(v)" :x2="tScale(v)" width="1"-->
<!--                  :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" :stroke="isRenderColor ? colorList[i] : 'black'" stroke-width="2" stroke-opacity="0.15"-->
<!--            > </line>-->
            <g v-for="(v, i) in dataList" :key="i">
              <line v-if="colorList[i] === 'black' || (!outlierIdx.has(i))" :x1="tScale(v)" :x2="tScale(v)" width="1"
                    :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2"
                    stroke="black" stroke-width="2" stroke-opacity="0.15"></line>
            </g>
            <g v-for="(v, i) in dataList" :key="i + 0.5">
              <line v-if="colorList[i] === 'red' && outlierIdx.has(i)" :x1="tScale(v)" :x2="tScale(v)" width="1"
                    :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2"
                    :stroke="isRenderColor?'red' : 'black'" stroke-width="2" stroke-opacity="0.15"></line>
            </g>
          </g>
        </g>
        <line v-if="val != undefined" :x1="tScale(val)" :x2="tScale(val)" width="2"
              :y1="(height - barHeight) / 2" :y2="height/2 + barHeight/2" :stroke="strokeColor"
        > </line>
        <text class="name" :x="width * 0.9" :y="textMarginY"
              style="font-size: 10px; text-anchor: end; user-select: none;">{{showName}}</text>
    </g>
</template>

<script>
import * as d3 from "d3";
export default {
    props: ['height', 'width', 'marginLR', 'barHeight', 'dataList', 'val', 'tScale', 'app','appendCtxType',
      'isRenderColor','colorList','isShowOutlier','sortedDataList', 'outlierNum','contextType'],
    name: "PercBar",
    data(){
        return {
            textMarginY: 0,
            strokeColor: this.appendCtxType === "DataLayout" ? this.isRenderColor ?'red':'black':'black',
            outlierIdx: undefined,
            initDone:false,
            strokeColor2: 'black'
        }
    },
    created() {
    },
    mounted(){
        // this.dataList.forEach(v => {console.log(this.tScale(v))})
        this.textMarginY = (this.height + d3.select(this.$el).select('.name').node().getBBox().height) / 2 - 2
        this.outlierIdx = new Set()
        if (this.sortedDataList === undefined){
          return
        }
        this.sortedDataList.slice(0 - this.outlierNum).forEach(item=>{
          this.outlierIdx.add(item["listIdx"])
        })
        this.strokeColor2 = this.isRenderColor?'red' : 'black'
        this.initDone = true
    },
    computed: {
        showName() {
            if(this.showMax === true){
                return this.val + '/' + this.maxVal
            }else{
                return this.val
            }
        },
        // strokeColor(){
        //   if (this.appendCtxType !== undefined && this.isRenderColor !== undefined && this.isRenderColor && this.appendCtxType === "DataLayout"){
        //     return 'red'
        //   }
        //   return 'black'
        // }
    },
    watch:{
        isRenderColor(){
          // this.initDone = false
          if (this.strokeColor === undefined){
            return
          }
          if (this.appendCtxType === "DataLayout" && this.isRenderColor){
            this.strokeColor = 'red'
          }else{
            this.strokeColor = 'black'
          }
        },
        appendCtxType(){
          if (this.strokeColor === undefined){
            return
          }
          if (this.appendCtxType === "DataLayout" && this.isRenderColor){
            this.strokeColor = 'red'
          }else{
            this.strokeColor = 'black'
          }
        },
        contextType(){
          this.initDone = false
          this.outlierIdx = new Set()
          if (this.sortedDataList === undefined){
            return
          }
          this.sortedDataList.slice(0 - this.outlierNum).forEach(item=>{
            this.outlierIdx.add(item["listIdx"])
          })
          this.initDone = true
        },
        outlierNum(){
          this.initDone = false
          this.outlierIdx = new Set()
          if (this.sortedDataList === undefined|| this.outlierNum === 0){
            this.initDone = true
            return
          }
          this.sortedDataList.slice(0 - this.outlierNum).forEach(item=>{
            this.outlierIdx.add(item["listIdx"])
          })
          this.initDone = true
        }
    }

}
</script>

<style scoped>

</style>
