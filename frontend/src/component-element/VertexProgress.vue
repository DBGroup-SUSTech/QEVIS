<template>
    <g :transform="'translate(' +  [vertex.layout.x, vertex.layout.y] + ')'"
       @click="clickNode"
       @mouseenter="enterNode"
       @mouseleave="leaveNode"
    >
        <g v-show="!showStepView">
            <rect :height="vertex.layout.height"
                  :width="vertex.layout.width"
                  :stroke="getNodeStroke()"
                  :stroke-width="getStrokeWidth()"
                  :fill="'url(#grad-' + app.aid+'-'+vertex.vid + ')'"
                  rx="1" ry="1"
                  class="vertex-rect">
                <title>{{ getNodeLabel() }}</title>
            </rect>
<!--            <text dy="2" style="font-size: 10px;">{{ getShortNodeLabel() }}</text>-->
        </g>
        <g v-show="showStepView">
            <g>
                <rect v-for="(stepData, i) in stepDataList" :key="i"
                      class="progress vertex-rect"
                      :x="stepData.offsetX"
                      :width="stepData.width"
                      :height="vertex.layout.height"
                      :fill="stepData.color"
                      rx="1" ry="1"
                      stroke-width="1" stroke-opacity="0">
                    <title>{{ stepNames[i] }}</title>
                </rect>
                <rect :height="vertex.layout.height"
                      :width="vertex.layout.width"
                      fill="none"
                      :stroke="getNodeStroke()"
                      :stroke-width="getStrokeWidth()"
                      rx="1" ry="1"
                      class="vertex-rect">
                </rect>
<!--                <text dy="2" style="font-size: 10px;">{{ getShortNodeLabel() }}</text>-->
            </g>
        </g>
    </g>
</template>

<script>
// import * as d3 from "d3";

import {HighlightMode} from "@/utils/const/HightlightMode";

export default {
    name: "Vertex",
    props: ['vertex', 'layoutConfig', 'colorSchema', 'app', 'showStepView', 'stepNames'
        // 'getNodeStroke', 'getStrokeWidth', 'enterNode', 'clickNode', 'leaveNode', 'getNodeLabel'
    ],
    data() {
        return {
            clicked: false,
        }
    },
    methods: {
        enterNode() {
            this.$store.commit('comparison/changeHighlightVertex', {
                app: this.app,
                vertex: this.vertex._mainObj,
                toHighlight: true,
            });
        },
        clickNode() {
            console.log('click', this);
            this.$store.commit('comparison/handleTDAGNodeClick',
                    {app: this.app, vertex: this.vertex._mainObj})
            this.clicked = true;
        },
        leaveNode() {
            this.$store.commit('comparison/changeHighlightVertex', {
                app: this.app,
                vertex: this.vertex._mainObj,
                toHighlight: false,
            });
            if (this.clicked) {
                this.clicked = false;
                this.$store.commit('comparison/handleTDAGNodeClickCancel',
                        {app: this.app, vertex: this.vertex._mainObj})
            }
        },
        getShortNodeLabel() {
            const name = this.vertex.vertexName;
            return name.charAt(0) + name.match(/.* (\d*)/)[1];
        },
        getNodeLabel() {
            return this.vertex.vertexName;
        },
        getNodeStroke() {
            switch (this.vertex.interact.highlightMode) {
                case HighlightMode.CURRENT: return this.colorSchema['highlightAsCurrent'];
                case HighlightMode.PROVIDER: return this.colorSchema['highlightAsProvider'];
                case HighlightMode.CONSUMER: return this.colorSchema['highlightAsConsumer'];

                case HighlightMode.NONE:
                default: return 'grey';
            }
        },
        getStrokeWidth() {
            switch (this.vertex.interact.highlightMode) {
                case HighlightMode.CURRENT:
                case HighlightMode.PROVIDER:
                case HighlightMode.CONSUMER: return 4;

                case HighlightMode.NONE:
                default: return 1;
            }
        },
    },
    computed: {
        stepDataList() {
            const stepDataList = [];
            for (let i = 0; i < 3; i++) {
                stepDataList.push({
                    timeSum: 0,
                    offsetX: 0,
                    width: 0,
                    color: this.layoutConfig.stepColors[i],
                })
            }

            this.vertex.tasks.forEach(t => {
                if (!t.stepMap) {
                    return;
                }
                for (let i = 0; i < 3; i++) {
                    if (!t.stepMap.has(i)) {
                        continue;
                    }
                    const step = t.stepMap.get(i);
                    if (!step) {
                        continue;
                    }

                    stepDataList[i].timeSum += step.end - step.start;
                }
            });
            const totalTimeSum = stepDataList.reduce((sum, d) => sum + d.timeSum, 0);
            if (totalTimeSum !== 0) {
                let offsetX = 0;
                stepDataList.forEach(stepData => {
                    stepData.width = this.vertex.layout.width * stepData.timeSum / totalTimeSum;
                    stepData.offsetX = offsetX;
                    offsetX += stepData.width;
                });
            }

            return stepDataList;
        },
    }
}
</script>

<style scoped>

</style>
