<template>
    <g class="container">
        <rect :width="width" :height="height" :fill="fillColor" stroke="white" opacity="0.1" @click="click"></rect>
    </g>
</template>

<script>
import * as d3 from "d3"
export default {
    name: "Cell",
    props: ['width', 'height', 'columns', 'index', 'data'],
    mounted(){
        let nameText = d3.select(this.$el).append('text').text(this.name).style('font-size', 11)
        let rectangle = nameText.node().getBoundingClientRect()
        nameText.attr('x', (this.width - rectangle.width) / 2)
            .attr('y', this.height / 2 + rectangle.height / 2)
    },
    methods: {
        click(){
            this.data.extend = !this.data.extend
            if(this.data.extend && this.data.values != undefined){
                this.data.config.height = d3.sum(this.data.values, d=>d.config.height) + this.data.config.unitHeight
            }else {
                this.data.config.height = this.data.config.unitHeight
            }
            console.log('click', this.data.extend)
        }
    },
    computed: {
        name(){
            const columnName = this.columns[this.index]
            if(this.data[columnName] != undefined){
                if(columnName == 'task'){
                    return this.data[columnName].slice(-12)
                }else{
                    return this.data[columnName]
                }

            } else{
                return this.columns[this.index]
            }

        },
        fillColor(){
            if(this.data.extend === false) {
                return 'grey'
            }else {
                return 'red'
            }
        }
    }
}
</script>

<style scoped>

</style>