<template>
    <g class="boxplot">
        <line style="stroke-width:1" :stroke="color"
              :x1="bpSrc[0]" :y1="(height - lineHeight) / 2"
              :x2="bpSrc[0]" :y2="(height + lineHeight) / 2"/>
        <line style="stroke-width:1" :stroke="color"
              :x1="bpSrc[0]" :y1="height / 2"
              :x2="bpSrc[1]" :y2="height / 2"/>

        <line style="stroke-width:1" :stroke="color"
              :x1="bpSrc[3]" :y1="height / 2"
              :x2="bpSrc[4]" :y2="height / 2"/>
        <line style="stroke-width:1" :stroke="color"
              :x1="bpSrc[4]" :y1="(height - lineHeight) / 2"
              :x2="bpSrc[4]" :y2="(height + lineHeight) / 2"/>

        <rect :x="bpSrc[1]" :y="(height - boxHeight) / 2"
              :width="bpSrc[3] - bpSrc[1]" :height="boxHeight"
              :fill="'none'" fill-opacity="0.8"/>
        <rect :stroke="color" stroke-width="1" fill="none"
              :x="bpSrc[1]" :y="(height - boxHeight) / 2"
              :width="bpSrc[3] - bpSrc[1]" :height="boxHeight"/>

        <line style="stroke-width:1" :stroke="color"
              :x1="bpSrc[2]" :y1="(height - boxHeight) / 2"
              :x2="bpSrc[2]" :y2="(height + boxHeight) / 2"/>
    </g>
</template>

<script>
import {mapState} from "vuex";

export default {
    name: "Boxplot",
    props: ['height', 'color', 'bpSrc'],
    data() {
        return {

        }
    },
    methods: {

    },
    computed: {
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema,
            // stepColors: state => state.LayoutConfig.stepColors,
            // outlierColors: state => state.LayoutConfig.outlierColors,
        }),
        boxHeight() {
            return this.height * 0.75
        },
        lineHeight() {
            return this.height * 0.60
        },
    }
}
</script>

<style scoped>

</style>
