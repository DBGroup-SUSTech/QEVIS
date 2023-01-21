<template>
    <g :transform="rowTransform">
        <!--:transform="generateTransform(sum(currentRatio.slice(0, i)) * width, 0)"-->
        <Cell v-for="(r, i) in currentRatio" :key="i" :width="width*r"
              :transform="generateTransform(sum(currentRatio.slice(0, i)) * width, 0)"
              :height="height" :columns="currentColumns"
              :data="data"
              :index="i">
        </Cell>
        <g v-if="subvalues !== undefined && data.extend === true" :transform="'translate(' + [0, data.config.unitHeight] + ')'">
            <g v-for="(subData, index) in subvalues" :key="subData.key" >
                <Row :widthRatio="widthRatio" :data="subData" :width="width" :columns="columns"
                     :index="index" :brothers="subvalues" :height="height"></Row>
            </g>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"
import Cell from "./Cell"
// import Row from "./Row"
export default {
    name: "Row",
    props: ['widthRatio', 'data', 'width', 'columns', 'index', 'brothers'],
    components:{ Cell},
    mounted(){
    },
    methods: {
        sum(arr) {
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
    },
    watch: {
        totalHeight(height){
            console.log('total height', height, this.data)
            this.data.config.height = this.totalHeight + this.data.config.unitHeight
        }
    },
    computed: {
        height(){
            return this.data.config.height
        },
        currentRatio() {
            return  this.widthRatio
            // if(this.data.type === 'vertex'){
            //     return [d3.sum(this.widthRatio.slice(0, 3)), ...this.widthRatio.slice(3, this.widthRatio.length)]
            // }else if(this.data.type === 'machine'){
            //     return [this.widthRatio[0], d3.sum(this.widthRatio.slice(1, 3)), ...this.widthRatio.slice(3, this.widthRatio.length)]
            // }
            // return this.widthRatio.slice(0, this.widthRatio.length)
        },
        rowTransform() {
            const x = 0
            return 'translate(' + [x, this.y]+ ')'
        },
        y(){
            let y = 0
            for(let i = 0, ilen = this.index; i < ilen; i++){
                y += this.brothers[i].config.height
            }
            return y
        },
        currentColumns() {
            // if(this.data.type === 'vertex'){
            //     return [this.columns[0], ...this.columns.slice(3, this.columns.length)]
            // }else if(this.data.type === 'machine'){
            //     return [this.columns[0],this.columns[1], ...this.columns.slice(3, this.columns.length)]
            // }else if(this.data.type === 'task'){
            //     return [...this.columns]
            // }
            return this.columns
        },
        subvalues(){
            return this.data.values
        },
        totalHeight(){
            if(this.data.values){
            return d3.sum(this.data.values, d=>d.config.height)
            }else{
                return this.data.config.height
            }

        }
        // gTransform(){
        //     return 'translate(' + [this.sum(this.currentRatio.slice(0, this.i)) * this.width, 0] + ')'
        // }
    }
}
</script>

<style scoped>

</style>