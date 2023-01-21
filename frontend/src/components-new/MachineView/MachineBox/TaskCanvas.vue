<template>
    <div >
    </div>
</template>

<script>

import ParticleSystem from "@/components-new/MachineView/MachineBox/ParticleSystem";
import * as d3 from 'd3'
export default {
    name: "TaskCanvas",
    props: ["app", 'taskList'],
    data(){
        return {
            ps: undefined
        }
    },
    mounted(){
        this.ps = new ParticleSystem(this.$el)
    },
    watch:{
        renderSign(){
            this.ps.init()
            let vertices = []
            let startTime = d3.min(this.taskList, task=>task.start_time)
            let endTime = d3.max(this.taskList, task=> task.end_time)
            let xTimeScale = d3.scaleLinear().domain([startTime, endTime]).range([-this.$el.clientWidth, this.$el.clientWidth])
            let yTimeScale = d3.scaleLinear().domain([startTime, endTime]).range([this.$el.clientWidth, -this.$el.clientWidth])
            let colors = []
            this.taskList.forEach(task=>{
                vertices.push(xTimeScale(task.end_time),yTimeScale(task.start_time), 0)
                if(task.hv_type == "Map"){
                    colors.push(27 / 255, 158 / 255, 119 / 255)
                }else {
                    colors.push(217 / 255, 95 / 255, 2 / 255)
                }
            })

            this.ps.addVertices(vertices, colors)
            let _this = this
            animate()
            function animate() {
                requestAnimationFrame( animate );
                _this.ps.render();
            }
            console.log('render task canvas', this.taskList)
        }
    },
    computed:{
        renderSign() {


            return this.app.renderSign
        },
    }
}
</script>

<style scoped>

</style>