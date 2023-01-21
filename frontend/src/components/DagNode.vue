<template>
    <g :transform="'translate(' +  [node.x , node.y] + ')'">
        <rect :fill="fill" fill-opacity="0.5" rx="3" ry="3"
              :width="node.width" :height="node.height"
              :stroke-width="strokeWidth" :stroke="stroke"
        ></rect>
        <text class="title" font-size="12" text-anchor="middle" style="cursor: default">{{ vertexName }}</text>
    </g>
</template>

<script>
import * as d3 from "d3"
import {mapState} from "vuex";
import {HighlightMode} from "@/utils/const/HightlightMode";

export default {
    name: "DagNode",
    props: ['node'],
    mounted() {

        let title = d3.select(this.$el).select('.title');
        // let boundaryRect = title.node().getBoundingClientRect();
        let boundaryRect = title.node().getBBox();
        title.attr('dx', this.node.width / 2)
            .attr('dy', boundaryRect.height / 2 + this.node.height / 2 - 3);
    },
    computed: {
        ...mapState('comparison', {
            colorSchema: state => state.colorSchema
        }),
        vertexName() {
            let nameSegs = this.node.vertexName.split(' ');
            return nameSegs.map(seg => (/[0-9]/.test(seg[0]) ? seg : seg[0])).join('')
        },
        stroke() {
            switch (this.node.interact.highlightMode) {
                case HighlightMode.CURRENT: return this.colorSchema['highlightAsCurrent'];
                case HighlightMode.PROVIDER: return this.colorSchema['highlightAsProvider'];
                case HighlightMode.CONSUMER: return this.colorSchema['highlightAsConsumer'];

                case HighlightMode.NONE:
                default: return 'grey';
            }
        },
        strokeWidth() {
            switch (this.node.interact.highlightMode) {
                case HighlightMode.CURRENT:
                case HighlightMode.PROVIDER:
                case HighlightMode.CONSUMER: return 4;

                case HighlightMode.NONE:
                default: return 1;
            }
        },
        fill() {
            if (this.node.type !== "OtherType") {
                return this.colorSchema[this.node.type];
            } else {
                return 'grey';
            }
        },
    },
    methods: {
        // mouseover() {
        //     this.$store.commit('simulation/hoverVertex', this.node.name);
        // },
        // mouseout() {
        //     this.$store.commit('simulation/hoverOutVertex', this.node.name)
        // },
        // clickNode(){
        //     console.log('click', this.node);
        //     this.$store.commit('simulation/selectVertex', this.node)
        // }
    }
}
</script>

<style scoped>

</style>
