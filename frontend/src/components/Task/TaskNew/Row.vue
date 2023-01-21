<template>
    <g :transform="rowTransform">
        <rect style="rx:3; ry:3" :width="width" :height="data.config.unitHeight" fill="grey"
              fill-opacity="0.3" stroke="white"></rect>
        <text>{{this.data.key}}</text>
        <path v-if="data.extend!==undefined" :d="generateTriangle" :fill="'#3e3e3e'" stroke="white" @click="clickExtend"></path>
        <g v-if="subvalues !== undefined && data.extend === true" :transform="'translate(' + [0, data.config.unitHeight] + ')'">
            <g v-for="(subData, index) in subvalues" :key="subData.key" transform="translate(40, 0)">
                <Row :widthRatio="widthRatio" :data="subData" :width="width - 40" :columns="columns"
                     :index="index" :brothers="subvalues" :height="height"></Row>
            </g>
        </g>
    </g>
</template>

<script>
import * as d3 from "d3"

// import Row from "./Row"
export default {
    name: "Row",
    props: ['widthRatio', 'data', 'width', 'columns', 'index', 'brothers'],
    components:{ },
    mounted(){
    },
    methods: {
        sum(arr) {
            return d3.sum(arr)
        },
        generateTransform(x, y) {
            return 'translate(' + [x, y] + ')'
        },
        clickExtend(){
            this.data.extend = !this.data.extend
            if(this.data.extend && this.data.values != undefined){
                this.data.config.height = d3.sum(this.data.values, d=>d.config.height) + this.data.config.unitHeight
            }else {
                this.data.config.height = this.data.config.unitHeight
            }
            console.log('click', this.data.extend)
        }
    },
    watch: {
        totalHeight(height){
            console.log('total height', height, this.data)
            this.data.config.height = this.totalHeight + this.data.config.unitHeight
        }
    },
    computed: {
        generateTriangle(){
            let length = 12
            let width = 10
            const l1 = 10
            const t1 = (this.data.config.unitHeight - length) / 2
            const l2 = l1 - 2
            const t2 = (this.data.config.unitHeight - width) / 2
            if(!this.data.extend) {
                const array = [[l1, t1], [l1 + width, t1 + length / 2], [l1 , t1 + length]]
                let line = d3.line().x(d=>d[0]).y(d=>d[1])
                return line(array)
            }else{
                const array = [[l2, t2], [l2 + length, t2], [l2 + length / 2, t2 + width]]
                let line = d3.line().x(d=>d[0]).y(d=>d[1])
                return line(array)
            }
        },
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