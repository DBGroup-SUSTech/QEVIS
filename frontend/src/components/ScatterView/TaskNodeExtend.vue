<template>
    <g>
        <g :transform="transform" v-if="task.selectedToExtend">
            <rect :width="width" :height="barHeight" stroke="grey" fill="none"></rect>
            <rect v-for="(step, i) in steps" :id="i" :key="i"
                  :x="step.x" :width="step.width" :height="barHeight" :fill="stepColors[i]"></rect>
        </g>
    </g>
</template>

<script>
import {mapState} from "vuex";

export default {
    name: "TaskNode",
    props: ['task', 'xScale', 'yScale', 'x', 'y', "width", 'barHeight'],
    data(){
        return {}
    },
    mounted(){},
    computed: {
        steps(){

            let steps = [];
            let x = 0;
            this.task.time_len.forEach(step=>{
                let width = this.xScale(step) - this.xScale(0);
                steps.push({
                    width: width,
                    x: x
                })
                x+= width;
            })
            return steps;
        },
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema,
            stepColors: state => state.layoutConfig.stepColors
        }),
        // x() {
        //     if (this.xScale != undefined) {
        //         return this.xScale(this.task.end_time);
        //     }else{
        //         return 0
        //     }
        // },
        // y() {
        //     if (this.xScale != undefined) {
        //         return this.xScale(this.task.start_time);
        //     }else{
        //         return 0
        //     }
        // },
        transform() {
            return "translate(" + [this.x, this.y] + ')'
            // return "translate(" + [this.task.extendLayuout.x, this.task.extendLayuout.y] + ')'
        },

        fill() {
            if (!this.task) return 'white';
            if (this.task.layout.selected == true) {
                return this.colorSchema['selected'];
            } else if (this.task.layout.selected == false) {
                return this.colorSchema[this.task.hv_type];
            }
            return 'black'
        },
        opacity() {
            if (!this.task) return 1
            if (this.task.layout.selected == true) {
                return 1;
            } else if (this.task.layout.selected == false) {
                return 0.4;
            }
            return 1
        },
    }
}
</script>

<style scoped>

</style>