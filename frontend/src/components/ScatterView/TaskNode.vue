<template>
    <g>
        <g :transform="transform" v-if="!task.selectedToExtend">
            <circle v-if="xScale" :opacity="opacity" :ax="task.end_time" :maxTime="xScale.domain()[1] - task.end_time"
                    :r="4/transformK" :fill="fill" stroke="black" :stroke-width="task.fail ? 2 : 0"></circle>
        </g>
        <g :transform="transform" v-if="task.selectedToExtend">
            <circle v-if="xScale" :opacity="opacity" :ax="task.end_time" :maxTime="xScale.domain()[1] - task.end_time"
                    :r="4/transformK" fill="black"
            :stroke="'black'"
            ></circle>

        </g>
<!--        <g :transform="transform2" v-if="task.selectedToExtend">-->
<!--            <rect v-for="step in steps" :key="step.i" :x="step.x" :width="step.width" height="5" fill="red"></rect>-->
<!--        </g>-->

        <line :stroke="fill" :stroke-width="0.5/transformK" v-if="isHighlighted" :x1="y" :y1="y" :x2="x" :y2="y"/>
    </g>
</template>

<script>
import {mapState} from "vuex";
// import * as d3 from "d3";

export default {
    name: "TaskNode",
    props: ['task', 'xScale', 'yScale', 'transformK'],
    data(){
        return {}
    },
    mounted(){},
    watch:{
        selected(){
            if(this.selected == true){
                this.$el.parentNode.appendChild(this.$el);
            }
        }
    },
    computed: {
        selected(){
            return this.task.layout.selected;
        },
        steps(){
            let steps = [];
            let x = this.xScale(this.task.start_time);
            let curStart = this.task.start_time;
            this.task.time_len.forEach((step, i)=>{
                curStart += step;
                let width = this.xScale(curStart) - x;
                steps.push({x:x, i:i, width: width});
                x += width;
            })
            return steps;
        },
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema
        }),
        x() {
            if (this.xScale != undefined) {
                return this.xScale(this.task.end_time);
            }else{
                return 0
            }
        },
        y() {
            if (this.yScale != undefined) {
                return this.yScale(this.task.start_time);
            }else{
                return 0
            }
        },
        transform() {
            return "translate(" + [this.x, this.y] + ')'
        },
        transform2() {
            return "translate(" + [this.task.extendLayuout.x, this.task.extendLayuout.y] + ')'
        },
        fill() {
            if (!this.task) return 'white';
            if (this.task.layout.selectedClick == true){
                return "blue";
            } else if (this.task.layout.selected == true ) {
                return this.task.fail ? this.colorSchema['selectedFail'] : this.colorSchema['selected'];
            } else if (this.task.layout.selectAsProvider === true) {
                return this.colorSchema['selectAsProvider']
            } else if (this.task.layout.selectCurrent === true) {
                return this.colorSchema['selectCurrent']
            } else if (this.task.layout.selectAsConsumer === true) {
                return this.colorSchema['selectAsConsumer']
            } else {
                return this.task.fail ? this.colorSchema[this.task.hv_type + 'Fail']
                    : this.colorSchema[this.task.hv_type];
            }
        },
        opacity() {
            if (!this.task) return 1
            if (this.isHighlighted) {
                return 1;
            } else if (this.task.layout.selected == false) {
                return 0.4;
            }
            return 1
        },
        isHighlighted() {
            const layout = this.task.layout
            return layout.selected === true
                || layout.selectedClick === true
                || layout.selectAsProvider === true
                || layout.selectCurrent === true
                || layout.selectAsConsumer === true
        }
    }
}
</script>

<style scoped>

</style>
