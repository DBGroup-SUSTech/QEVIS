<template>
    <div style="width: 100%"
         >
        <el-row style="height: 0px; width: 100%; background-color: #8e8e8e">
            <div class="button-group">
<!--                <svg :width="iconSize" :height="iconSize" @click="toUnfoldMode"-->
<!--                     t="1630482904247" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"-->
<!--                     p-id="2517">-->
<!--                    <path-->
<!--                            d="M823.7 161.5H561.3v64h190L540.2 436.6l45.2 45.2 212.4-212.4v190h64V199.6c0-21-17.1-38.1-38.1-38.1zM437 544.1L224.6 756.4v-190h-64v259.8c0 21 17.1 38.1 38.1 38.1h262.4v-64h-190l211.1-211.1-45.2-45.1z"-->
<!--                            :fill="unfoldIconColor" p-id="2518"></path>-->
<!--                </svg>-->
<!--                <svg :width="iconSize" :height="iconSize" @click="toFoldMode"-->
<!--                     t="1630482931721" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"-->
<!--                     p-id="2658">-->
<!--                    <path-->
<!--                            d="M867.9 204.1l-45.3-45.3-212.4 212.5v-190h-64v259.9c0 21 17.1 38.1 38.1 38.1h262.5v-64H656.7l211.2-211.2zM442.7 547.8H180.3v64h190L159.2 823l45.3 45.3 212.4-212.4v190h64v-260c-0.1-21-17.2-38.1-38.2-38.1z"-->
<!--                            :fill="foldIconColor" p-id="2659"></path>-->
<!--                </svg>-->

                <svg :width="iconSize" :height="iconSize" @click="clickShowProgress"
                     t="1636033823264" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="998" >
                    <path
                            :fill="app.showProgress ?  '#494949' : '#d9d9d9'"
                            d="M667 198.3c17.1 0 31.1 14 31.1 31.1s-14 31.1-31.1 31.1H198v-62.2h469m0-70H128v202.2h539c55.8 0 101.1-45.3 101.1-101.1S722.8 128.3 667 128.3zM827.5 480.8c17.1 0 31.1 14 31.1 31.1s-14 31.1-31.1 31.1H198v-62.2h629.5m0-70H128V613h699.5c55.8 0 101.1-45.3 101.1-101.1s-45.3-101.1-101.1-101.1zM475 763.3c17.1 0 31.1 14 31.1 31.1s-14 31.1-31.1 31.1H198v-62.2h277m0-70H128v202.2h347c55.8 0 101.1-45.3 101.1-101.1S530.8 693.3 475 693.3z" p-id="2043"></path>
                </svg>
<!--                <svg :width="iconSize" :height="iconSize" @click="clickShowProgress"-->
<!--                     t="1636033823264" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="998" >-->
<!--                    <path d="M469.333333 85.333333c211.968 0 384 172.032 384 384s-172.032 384-384 384S85.333333 681.301333 85.333333 469.333333 257.365333 85.333333 469.333333 85.333333z m0 682.666667c164.992 0 298.666667-133.674667 298.666667-298.666667 0-165.034667-133.674667-298.666667-298.666667-298.666666-165.034667 0-298.666667 133.632-298.666666 298.666666 0 164.992 133.632 298.666667 298.666666 298.666667z m362.026667 3.029333l120.704 120.661334-60.373333 60.373333-120.661334-120.704 60.330667-60.330667z" fill="#000000" p-id="999">-->
<!--                    </path>-->
<!--                </svg>-->
                <svg :width="iconSize" :height="iconSize" @click="changeShowStepView"
                     t="1630570653155" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
                     p-id="3778">
                    <path
                            d="M960 160v704H497.312l128.192-352L497.28 160H960zM433.056 160l128.512 352-128.512 352H64V160h369.056zM296.64 346.88H243.36c-2.4 22.08-10.56 39.84-48 39.84v54.72h37.44V704H296.64V346.88z m497.6-4.32h-12.96c-48.96 0-65.28 33.12-65.28 66.72v62.88h60V416.96c0-11.52 2.88-16.32 12-16.32 8.64 0 12 4.8 12 16.32v21.6c0 12.96-0.48 23.04-17.76 51.84l-30.72 50.88-9.28 15.68c-28.48 49.216-33.472 69.184-33.92 105.056V704h161.76v-61.92h-107.04v-4.32c0.416-7.296 4.576-20.416 37.44-63.84l26.72-34.496 8.32-11.104c26.688-34.72 30.56-53.376 31.104-84l0.096-33.12c0-46.08-27.36-68.64-72.48-68.64z"
                            :fill="stepViewIconColor" p-id="3779"></path>
                </svg>

                <svg :width="iconSize" :height="iconSize" @click="clickShowPerf"
                     t="1636033823264" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="998" >
                    <path :fill="app.diagnoseData ? (app.showPerformance ?  '#494949' : '#d9d9d9') : 'grey'"
                          d="M512 512V85.333333a426.666667 426.666667 0 1 0 426.666667 426.666667z M576 90.645333V448h357.354667A426.261333 426.261333 0 0 0 576 90.645333z" p-id="3676"></path>
                </svg>

                <svg :width="iconSize" :height="iconSize" @click="changeGroupState"
                     style="margin-top: 1px"
                     t="1647392777838" class="icon" viewBox="-80 -80 1104 1104" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4755" >
                    <path :fill="isGroupAxis ? '#494949' : '#d9d9d9'"
                          d="M935.754805 89.966493a47.62257 47.62257 0 0 0-3.672102-4.590127A252.170113 252.170113 0 0 0 753.698885 8.893371c-66.384715 1.147532-131.794027 24.72931-180.621505 72.35188l-175.055976 175.572365A248.096375 248.096375 0 0 0 325.956407 437.209615a258.538914 258.538914 0 0 0 76.540371 179.875609c1.204908 1.204908 2.52457 2.295064 3.901608 3.270466a68.163389 68.163389 0 0 0 94.72875-4.475374 68.278142 68.278142 0 0 0-2.409817-95.991035 123.187539 123.187539 0 0 1-36.548887-85.720625 112.22861 112.22861 0 0 1 32.30302-81.302628l174.654339-175.342859c22.72113-21.745728 52.384827-34.425954 83.884575-32.589903a116.93349 116.93349 0 0 1 82.851796 36.835771c22.950636 22.72113 35.917745 53.130722 36.548887 85.778002a110.908948 110.908948 0 0 1-31.384994 80.212472L728.625315 456.717656a67.704376 67.704376 0 0 0-20.885079 47.852076c-0.401636 18.245756 6.368801 35.516109 19.049028 48.655348a68.278142 68.278142 0 0 0 96.507425 1.836051l113.376141-109.417157a248.899647 248.899647 0 0 0 72.064997-180.334622c-1.147532-67.933882-28.401412-131.73665-72.983022-175.342859z M520.864683 400.259091a68.565025 68.565025 0 0 0-1.893427 97.023814c22.950636 22.778506 35.975122 53.245475 36.606264 85.720625a111.88435 111.88435 0 0 1-32.30302 81.302628l-174.424833 175.055976a121.179358 121.179358 0 0 1-170.752732-171.728134l113.605648-119.974449a68.335519 68.335519 0 0 0-2.52457-96.450048 67.589623 67.589623 0 0 0-48.770101-18.647392c-18.188379 0.459013-35.114473 8.032723-47.737323 21.229339l-112.458116 118.769541c-96.679554 100.638539-94.269737 261.924133 5.106516 359.292206a260.661848 260.661848 0 0 0 183.605088 76.827253h1.204908a244.998039 244.998039 0 0 0 174.31008-72.294503l175.342859-175.629741a249.18653 249.18653 0 0 0 72.122374-180.334623 259.227433 259.227433 0 0 0-77.22889-180.449375 68.507648 68.507648 0 0 0-93.810725 0.286883z" p-id="4756"></path>
                </svg>
            </div>
        </el-row>
        <el-row v-show="app.showProgress || app.showStepView" style="height: 100%; width: 100%; margin-bottom: 5px;" >
            <!--            <svg style="height: 100%; width: 100%;" class="tdag-container">-->
            <svg style="width: calc(100% - 10px)" class="tdag-container svgContainer"
                 :style="{height: svgHeight + 'px'}"
                 @mousewheel = "handleScroll($event)"
                 @mousedown="handleDrag($event)">
                <defs>
<!--                  vertex color define here-->
                    <linearGradient v-for="[vid, colorTicks] in Array.from(colorPropMap.entries())"
                                    :key="vid"
                                    :id="'grad-' + app.aid + '-' + vid"
                                    x1="0" x2="1" y1="0" y2="0">
                        <stop v-for="(colorTick, i) in colorTicks" :key="i"
                              :offset="colorTick.percent + '%'" :stop-color="colorTick.color"/>
                    </linearGradient>
                    <linearGradient :id="'grad-' + app.aid + '-legend'">
                        <stop offset="0%" :stop-color="minTaskNoColor"></stop>
                        <stop offset="100%" :stop-color="maxTaskNoColor"></stop>
                    </linearGradient>
                    <linearGradient :id="'grad-' + app.aid + '-query'"
                                  x1="0" x2="1" y1="0" y2="0">
                      <stop v-for="(colorTick, i) in queryBarColor" :key="i"
                          :offset="colorTick.percent + '%'" :stop-color="colorTick.color"/>
                    </linearGradient>
                </defs>
                <rect fill="#f3f3f3" y=0 style="width: calc(100%);" :height="svgHeight"/>
                <g class="grid">
<!--                  <line v-for = "(num) in bgLine" v-bind:key = "num"-->
<!--                      :x1="num" y1="0" :x2="num" y2="300" style="stroke:#ffffff;stroke-width:1.5; stroke-opacity: 1"/>-->
                </g>



<!--                <line v-for = "(num) in rowLine" v-bind:key = "num"-->
<!--                      x1="0" :y1="num" :x2="width" :y2="num" style="stroke:#969696;stroke-width:2; stroke-opacity: 0.3"/>-->

                <g ref="paint" id="test">
                    <g>
                        <g v-if="loaded" class="progressContainer" transform="translate(0,50)">
                            <VertexProgress  v-for="(vertex) in renderedVertexes" v-bind:key="vertex.vid"
                                             :vertex="vertex"
                                             :layoutConfig="layoutConfig"
                                             :app="app"
                                             :colorSchema="colorSchema"
                                             :showStepView="app.showStepView"
                                             :stepNames="stepNames">
                            </VertexProgress>
                            <g class="edgeContainer">
                                <path v-for="({path, edge}, i) in pathModels" :key="i"
                                      :d="path" fill="none"
                                      :stroke="edge.isHidden && false ? 'rgba(38,38,38,0.16)' : 'rgb(125, 125, 125)'"
                                      :stroke-width="getEdgeStrokeWidth(edge)"></path>
                            </g>
                            <g class="edgeContainer">
                                <circle v-for="({dx, dy}, i) in pathModels" :key="i"
                                      :cx="dx" :cy="dy" r="2" fill="rgb(80, 80, 80)"></circle>
                            </g>
                            <g>
                                <rect v-for="(vertex) in renderedVertexes" v-bind:key="'rect-' + vertex.vid"
                                      :x="vertex.layout.x-1.5" :y="vertex.layout.y-11"
                                      :width="4 + getTextSize(getShortNodeLabel(vertex), '10px').width" height="13"
                                      rx="2" ry="2"
                                      :fill="'#ffffff'" opacity="0.6"/>
                                <text v-for="(vertex) in renderedVertexes" v-bind:key="'text-' + vertex.vid"
                                      :dx="vertex.layout.x" :dy="vertex.layout.y "
                                      style="font-size: 10px; user-select: none; pointer-events: none;">
                                    {{ getShortNodeLabel(vertex) }}
                                </text>
                            </g>
                        </g>
                    </g>
                    <g class="timeAxis" transform="translate(0, 20)">
                        <rect y=-20 fill="none" :width="width" height="20" opacity="1"></rect>
                    </g>
                    <g v-show="!app.showStepView" class="queryBar" :transform="'translate(' +[20,25] + ')'">
                      <rect :fill="'url(#grad-' + app.aid+'-query)'"
                            :width="queryBarLen" height="4"></rect>
                    </g>
                </g>

                <g v-if="!loaded">
                    <text :x="containerWidth/2 - 100" :y="containerHeight/2" font-size="30" opacity="0.3">
                        No data selected
                    </text>
                </g>
                <g class="detailStructure"></g>
                <g class="legend-container-0" v-show="loaded && !app.showStepView"
                   :transform="'translate(' + [8, svgHeight-15] + ')'">
                    <rect x="-5" y="-5" width="122" height="20"
                          rx="4" ry="4"
                          :fill="'#ffffff'" opacity="0.6"/>
                    <rect :x="0" :y="0"
                          :stroke="'gray'" :stroke-width="0.5"
                          :width="60" :height="10"
                          :fill="'url(#grad-' + app.aid + '-legend)'"></rect>
                    <text :dx="65" :dy="9.5" style="font-size: 12px; user-select: none">Task No.</text>
                </g>
                <g class="legend-container-1" v-show="loaded && app.showStepView"
                   :transform="'translate(' + [8, svgHeight-52] + ')'">
                    <rect x="-5" y="-5" width="80" height="52"
                          rx="4" ry="4"
                          :fill="'#ffffff'" opacity="0.6"/>
                    <rect v-for="(color, i) in layoutConfig.stepColors" :key="'rect-' + i"
                          :x="0" :y="16 * i" rx="2" ry="2"
                          :stroke="'gray'" :stroke-width="0.5"
                          :fill="color"
                          :width="10" :height="10"></rect>
                    <text v-for="(stepName, i) in stepNames" :key="'label' + i"
                          style="font-size: 12px; user-select: none"
                          :dx="14" :dy="9 + 16 * i">{{stepName}}</text>
                </g>

            </svg>
            <el-radio-group v-if="!app.showStepView" :fill="'#999999'"
                            class="checkbox-group" v-model="ratioName" size="mini">
                <el-radio-button :label="stepSelector[0]">{{stepSelector[0]}}</el-radio-button>
                <el-radio-button :label="stepSelector[1]">{{stepSelector[1]}}</el-radio-button>
                <el-radio-button :label="stepSelector[2]">{{stepSelector[2]}}</el-radio-button>
                <el-radio-button :label="stepSelector[3]">{{stepSelector[3]}}</el-radio-button>
            </el-radio-group>
        </el-row>
        <el-row v-if="app.showPerformance">
            <PerformanceMatrix style="left: 5px; width: calc(100% - 10px);"
                               :app="app"></PerformanceMatrix>
        </el-row>
    </div>
</template>

<script>
/* eslint-disable */
import * as d3 from "d3";
import {mapState} from "vuex";
import {TDAGCursorMode} from "@/utils/const/TDAGCursorMode";
import {Application} from "@/utils/entities/Application";
import VertexProgress from "@/component-element/VertexProgress";
import {HighlightMode} from "@/utils/const/HightlightMode";
import PerformanceMatrix from "@/components-new/PerformanceMatrix/PerformanceMatrix";
import RecvHeatmap from "@/components/Task/RecvHeatmap";
import {TDAGLayoutType} from "@/utils/const/TDAGLayoutType";
import {STEP_NAMES, StepType} from "@/utils/const/StepType";

const curveGen = d3.line().x(p => p[0]).y(p => p[1]).curve(d3.curveBasis)

// FIXME compute bar color
const colorGen = d3.interpolateBlues

function generateScale(newXScale) {
    let axis = d3.axisTop(newXScale)
    axis.ticks(10).tickFormat(d => (d) / 1000 + 's').tickSize(3)
    return axis
}

export default {
    name: "TDAGView",
    props: {
        /** @type{Application} */
        app: Application
    },
    components: {
      RecvHeatmap,
        VertexProgress,
        PerformanceMatrix,
    },
    data() {
        return {
            svgHeight: 300,
            // canvas to test text size
            testCanvas: document.createElement("canvas"),

            iconSize: 18,   // px
            containerWidth: 0,
            containerHeight: 0,
            mergeCount: 0,
            maxMergeCount: 10,
            testTransform: '',
            staticXScaleCopy: undefined,
            newXScale: undefined,
            width: 0,
            boundLeft : 0,
            zoom: null,
            domain: null,
            stepNames: STEP_NAMES,
            overallExtend: new Map(),
            stepSelectorIndex: 0,
            ratioName: "Overall",
            curClientX: 0,
            curXOff : 0,
            curClientY: 0,
            curYOff: 50,
            zoomEventLen: 0,
            zoomEventRatio: 0,
            zoomEventX: 0,
            paintLenRatio: 0,
            curRBound: 0,
            fixedBound: 0,
            fixedRightBound: 0,
            bgLine: [],
            rowLine:[],
            axisUpdate : 0,
            inited: false,


        }
    },
    mounted() {
        // window.addEventListener('mousewheel',this.handleScroll,true)
        let boundLeft = d3.select(this.$el).select(".grid")._groups[0][0].getBoundingClientRect().left
        this.boundLeft = boundLeft
        let width = this.$el.clientWidth;
        let height = this.$el.clientHeight;
        // console.log(width, height, this.$el)
        this.width = width
        this.containerHeight = height;
        this.containerWidth = width;
        this.$store.commit('comparison/changeTdagViewWidth', width);
        this.$store.commit('comparison/initTDAGView', {app: this.app});
        this.initSVGContainer();
        this.initial = true;
    },
    methods: {
        initSVGContainer() {
            let _this = this

            // d3.select('.testCircle').attr('cx', this.newXScale(start))

            // console.log('= d3.min(taskList, task => task.start_time', start, end, (end - start), (end - start) / 1000)

            let width = this.$el.clientWidth;
            let height = this.$el.clientHeight;

            this.svg = d3.select(this.$el).select('.tdag-container');
            // this.zoom = d3.zoom()
            //     .scaleExtent([-3, 8])
            //     .extent([[20, 20], [width - 20, height - 20]])
            //     .on('zoom', function () {
            //       // d3.event.transform
            //       //   console.log(d3.event.transform)
            //       //   console.log(d3.event.transform.get('y'))
            //         let tmp = d3.event.transform
            //         // tmp.k = 2
            //         // tmp.y = 0
            //         _this.svg.select('.progressContainer').attr('transform', tmp);
            //         // _this.svg.select('.progressContainer').attr('transform', d3.event.transform);
            //         _this.newXScale = tmp.rescaleX(_this.staticXScaleCopy);
            //         _this.updateAxis()
            //         // _this.$store.commit('comparison/changeTDAGTransform',
            //         //     {app: _this.app, transform: d3.event.transform})
            //     });
            // this.svg.call(this.zoom);
            this.curRBound = this.$refs.paint.getBoundingClientRect().x + 20;
            this.fixedBound = this.$refs.paint.getBoundingClientRect().x + 20;

            this.updateSvgHeight(false);
        },

        updateTimeAxis(){
          let domain;
          if (this.isGroupAxis){
            domain = this.groupDomain
          }
          else {
            domain = this.stateXScale.domain()
            let start = d3.min(this.taskList, task => task.start)
            let end = d3.max(this.taskList, task => task.end)
            domain[0] -= start
            domain[1] -= start
          }
          let domainRange = domain[1] - domain[0]
          let scale = this.stateXScale.range()[1] - this.stateXScale.range()[0];

          let domainTmp = [this.stateXScale.domain()[0], 0]
          let range = [this.stateXScale.range()[0], 0]
          if (this.zoomScale <= 0){
            domainTmp[1] = this.stateXScale.domain()[1] +  domainRange * Math.pow(2, -this.zoomScale)
            range[1] = this.stateXScale.range()[1] + scale * Math.pow(2, -this.zoomScale);
            this.newXScale = d3.scaleLinear().domain(domainTmp).range(range)
          }else{
            this.newXScale = d3.scaleLinear().domain(domain).range(this.stateXScale.range())
          }
          // console.log(range)
          // let tmpXMin = this.newXScale.domain()[0];//time
          // let tmpXMax = this.newXScale.domain()[1];
          //
          // let rangeXMin = this.newXScale.range()[0];//page
          // let rangeXMax = this.newXScale.range()[1];
          //
          // let ratio = (tmpXMax - tmpXMin) / (rangeXMax - rangeXMin);

          if (this.curRBound > this.fixedBound) {
            let tmpXMin = this.newXScale.domain()[0];//time
            let tmpXMax = this.newXScale.domain()[1];

            let rangeXMin = this.newXScale.range()[0];//page
            let rangeXMax = this.newXScale.range()[1];

            let ratio = (tmpXMax - tmpXMin) / (rangeXMax - rangeXMin);

            let xOff = this.curRBound - this.fixedBound;

            let rangeTmp = [rangeXMin - xOff, rangeXMax - xOff];
            let domainTmp = [tmpXMin - xOff * ratio, tmpXMax - xOff * ratio];
            this.newXScale = d3.scaleLinear().domain(domainTmp).range(rangeTmp);
          }

          let tmpXMin = this.newXScale.domain()[0];//time
          let tmpXMax = this.newXScale.domain()[1];

          let rangeXMin = this.newXScale.range()[0];//page
          let rangeXMax = this.newXScale.range()[1];

          let ratio = (tmpXMax - tmpXMin) / (rangeXMax - rangeXMin);

          if (rangeXMax - this.fixedBound < this.width - 20){


            let xOff = this.width - 20 + this.fixedBound - rangeXMax;

            let rangeTmp = [rangeXMin, rangeXMax + xOff];
            let domainTmp = [tmpXMin, tmpXMax + xOff * ratio];
            this.newXScale = d3.scaleLinear().domain(domainTmp).range(rangeTmp);
          }
          this.updateAxis()

          if (!this.inited){
            this.fixedRightBound = this.$refs.paint.getBoundingClientRect().right;
            this.inited = true;
          }

        },

        handleScroll(event){
          let zoomIn = event.deltaY < 0;
          this.zoomEventLen = event.x - this.curRBound;
          this.zoomEventX = event.x;
          this.zoomEventRatio = (this.zoomEventLen) / (this.stateXScale.range()[1] - this.stateXScale.range()[0]);

          this.$store.commit("comparison/handleZoom", {aid: this.app.aid, zoomIn: zoomIn, zoomEventLen: this.zoomEventLen, zoomEventRatio: this.zoomEventRatio});
        },
        getShortNodeLabel(vertex) {
            const name = vertex.vertexName;
            return name.charAt(0) + name.match(/.* (\d*)/)[1];
        },
        getTextSize(text, font) {
            const cxt = this.testCanvas.getContext('2d');
            cxt.font = font;
            return cxt.measureText(text);
        },
        updateSvgHeight(useMax=true) {
            const maxY = Math.max(...this.app.tdagModel.vertexes.map(v => v.layout.y));
            if (useMax) {
                this.svgHeight = Math.max(this.svgHeight, maxY + 80);
            } else {
                this.svgHeight = maxY + 80;
            }
        },

        handleDrag(event){
          // this.curClientX = event.clientX;
          // this.curClientY = event.clientY

          this.$store.commit("comparison/handleDrag",{aid: this.app.aid, curClientX: event.clientX, curClientY: event.clientY})
        },

        dragStart(){
          this.curClientX = this.app.tdagModel.dragPara.get("curClientX");
          this.curClientY = this.app.tdagModel.dragPara.get("curClientY");

          window.addEventListener('mousemove', this.mouseMove);
          window.addEventListener('mouseup', this.mouseUp);
        },

        mouseMove(event){
          let xOff = event.clientX - this.curClientX;
          let YOff = event.clientY - this.curClientY;

          this.curClientX = event.clientX
          this.curXOff += xOff;

          this.curClientY = event.clientY
          this.curYOff += YOff;

          let marginXOff = 20 + this.curXOff
          d3.select(this.$el).select('.progressContainer').attr('transform', 'translate(' + this.curXOff + "," + this.curYOff + ")");
          d3.select(this.$el).select('.timeAxis').attr('transform', 'translate(' + this.curXOff + ",20)");
          d3.select(this.$el).select('.queryBar').attr('transform', 'translate(' + marginXOff + ",25)");


          let tmpXMin = this.newXScale.domain()[0];//time
          let tmpXMax = this.newXScale.domain()[1];

          let rangeXMin = this.newXScale.range()[0];//page
          let rangeXMax = this.newXScale.range()[1];

          let ratio = (tmpXMax - tmpXMin) / (rangeXMax - rangeXMin);
          if (xOff > 0){
            let rangeTmp = [rangeXMin - xOff, rangeXMax - xOff];
            let domainTmp = [tmpXMin - xOff * ratio, tmpXMax - xOff * ratio];
            this.newXScale = d3.scaleLinear().domain(domainTmp).range(rangeTmp);
          }else{
            let rangeTmp = [rangeXMin - xOff, rangeXMax - xOff];
            let domainTmp = [tmpXMin - xOff * ratio, tmpXMax - xOff * ratio];
            this.newXScale = d3.scaleLinear().domain(domainTmp).range(rangeTmp);
          }
          this.updateAxis();

          this.curRBound += xOff

        },

        mouseUp(event){
          this.$store.commit("comparison/closeDrag", {aid: this.app.aid})
        },

        dragClose(){
          window.removeEventListener('mousemove', this.mouseMove);
          window.removeEventListener('mouseup', this.mouseUp);
        },

        updateAxis() {
        let range = this.newXScale.range();
        let domain = this.newXScale.domain();
        let curRBound = this.$refs.paint.getBoundingClientRect().right;

        let tmpXMin = domain[0];//time
        let tmpXMax = domain[1];

        let rangeXMin = range[0];//page
        let rangeXMax = range[1];

        let ratio = (tmpXMax - tmpXMin) / (rangeXMax - rangeXMin);

        let rangeTmp = [rangeXMin, rangeXMax];
        let domainTmp = [tmpXMin, tmpXMax];

        if(range[0] > 0){
          let xOff = rangeXMin
          rangeTmp[0] = rangeTmp[0] - xOff;
          domainTmp[0] = domainTmp[0] - xOff * ratio;
        }

        if (rangeXMax + this.curRBound < this.fixedRightBound){
          let xOff = this.fixedRightBound - (rangeXMax + this.curRBound);
          rangeTmp[1] = rangeTmp[1] + xOff;
          domainTmp[1] = domainTmp[1] + xOff * ratio;
            // this.newXScale = d3.scaleLinear().domain(domainTmp).range(rangeTmp);

        }
        this.newXScale = d3.scaleLinear().domain(domainTmp).range(rangeTmp);

        d3.select(this.$el).select('.timeAxis').call(generateScale(this.newXScale));
        d3.select(this.$el).select('.timeAxis')
            .selectAll('text')
            .style('font-size', 12)
            .style('stroke', "black")
            .style('stroke-width',0.2)

        let tmp = d3.select(this.$el).select('.timeAxis')
            .selectAll('.tick')

        this.bgLine = []
        let len = tmp._groups[0].length
        for (let i =0; i < len; i += 1){
          let item = tmp._groups[0][i]
          this.bgLine.push((item.getBoundingClientRect().left + item.getBoundingClientRect().right) / 2 - this.boundLeft)
        }
        this.axisUpdate ^= 1
      },

        getTrend(taskList) {
          // console.log(taskList)
            let usage = [];
            let trend = [];
            let count = 0;
            if (this.stepSelectorIndex !== 0){
              let index = this.stepSelectorIndex - 1
              taskList.forEach(task => {
                    if (!task.stepMap) {
                        return;
                    }
                    if (!task.stepMap.has(index)){
                      return
                    }
                    //TODO modify here
                    usage.push({'type': 'start', 'time': task.stepMap.get(index).start, "taskId":task.tid});
                    usage.push({'type': 'end', 'time': task.stepMap.get(index).end, "taskId":task.tid});
                })
            }else{
                taskList.forEach(task => {
                    if (!task.stepMap) {
                        return;
                    }
                    if (!task.stepMap.has(3) || !task.stepMap.has(4)){
                        return
                    }
                    //TODO modify here
                    usage.push({'type': 'start', 'time': task.stepMap.get(3).start, "taskId":task.tid});
                    usage.push({'type': 'end', 'time': task.stepMap.get(4).end, "taskId":task.tid});
                })
            }
            usage.sort((a, b) => (a.time > b.time) ? 1 : -1);
            let lastTaskId = ""
            usage.forEach(u => {
                if (u.type === 'start') {
                    count += 1;
                }else if (u.type === 'end') {
                    count -= 1;
                } else{
                    console.log('error type')
                }
                if (trend.length > 0 && trend[trend.length - 1].time === u.time) {
                    trend[trend.length - 1].count = count;
                } else {
                    if (trend.length == 0) {
                        trend.push({'time': u.time, 'count': 1})
                    }
                    // console.log('count', count)
                  // trend.push({'time': u.time, 'count': count === 0 && u.taskId === lastTaskId ? 1 : count})
                  // lastTaskId = u.task
                  trend.push({'time': u.time, 'count': count})
                }
            });
            // trend.push({'time': usage[usage.length - 1].time, 'count': 0})
            return trend
        },
        getQueryColorTicks(trend, globalMaxCount){
            if (trend.length === 0) {
              return []
            }
          let timeExtent = d3.extent(trend, u => u.time)
          const getTimePercent = function getTimePercent(time) {
            if (time === timeExtent[0]) {
              return 0
            }

            return (time - timeExtent[0]) / (timeExtent[1] - timeExtent[0]) * 100
          }
          const colorTicks = []

          // remove last one (as it must be 0)
          for (let i = 0; i < trend.length - 1; ++i) {
            const t0 = trend[i], t1 = trend[i + 1]
            let color
            if (t0.count === 0) {
              color = 'gray'
            } else {
              color = colorGen(t0.count / (globalMaxCount + 5 ))
            }
            //TODO verify here
            colorTicks.push({percent: getTimePercent(t0.time) , color})
            colorTicks.push({percent: getTimePercent(t1.time), color})
          }
          let color = "grey"
          colorTicks.push({percent: getTimePercent(trend[trend.length - 1].time), color})

          return colorTicks

        },
        getColorTicks(vid, trend, timeInterval, globalMaxCount) {
            if (trend.length === 0) {
                return []
            }
            let timeExtent = d3.extent(trend, u => u.time)
            if (this.stepSelectorIndex === 0 ){
                if (!this.overallExtend.has(vid)) {
                    this.overallExtend.set(vid, timeExtent)
                }
            }
            timeExtent = this.overallExtend.get(vid);
            const getTimePercent = function getTimePercent(time) {
                if (time === timeExtent[0]) {
                    return 0
                }

                return (time - timeExtent[0]) / (timeExtent[1] - timeExtent[0]) * 100
            }
            const colorTicks = []

            // remove last one (as it must be 0)
            for (let i = 0; i < trend.length - 1; ++i) {
                const t0 = trend[i], t1 = trend[i + 1]
                let color
                if (t0.count === 0) {
                    color = 'gray'
                } else {
                    color = colorGen(t0.count / (globalMaxCount + 5))
                }
                //TODO verify here
                colorTicks.push({percent: getTimePercent(t0.time) , color})
                colorTicks.push({percent: getTimePercent(t1.time), color})
            }
            // let color = "grey"
            // colorTicks.push({percent: getTimePercent(trend[trend.length - 1].time), color});

            // let maxTime = d3.max(trend, t => t.time)
            // for (;maxTime<timeExtent[1];maxTime++){
            //
            // }
            //         let color = 'gray'
            // colorTicks.push({percent: getTimePercent(maxTime), color})

            return colorTicks
        },
        clickShowProgress(){
            this.app.showProgress ^= true;
            this.app.showStepView = !this.app.showProgress;
        },
        clickShowPerf(){
            if (!this.app.diagnoseData) {
                return;
            }
            this.app.showPerformance ^= 1;
        },
        getIndex(ary, val){
            let index = null;
            ary.every(function (value, i){
                if (val === value){
                    index = i;
                    return false;
                }
                return true;
            });
            return index;
        },
        changeMergeCount(mergeCount) {
            if (this.loaded) {
                this.$store.commit('comparison/changeMergeCount', mergeCount)
                this.$store.commit('comparison/updateLayout')
            }
        },
        toUnfoldMode() {
            console.log('unfold', this.tdagCursorMode)
            if (this.tdagCursorMode === TDAGCursorMode.UNFOLD) {
                this.$store.commit('comparison/changeTDAGCursorMode',
                    {app: this.app, mode: TDAGCursorMode.NORMAL})
            } else {
                this.$store.commit('comparison/changeTDAGCursorMode',
                    {app: this.app, mode: TDAGCursorMode.UNFOLD})
            }
        },
        toFoldMode() {
            console.log('fold', this.tdagCursorMode)
            if (this.tdagCursorMode === TDAGCursorMode.FOLD) {
                this.$store.commit('comparison/changeTDAGCursorMode',
                    {app: this.app, mode: TDAGCursorMode.NORMAL})
            } else {
                this.$store.commit('comparison/changeTDAGCursorMode',
                    {app: this.app, mode: TDAGCursorMode.FOLD})
            }
        },
        changeShowStepView() {
            this.app.showStepView ^= true;
            this.app.showProgress = !this.app.showStepView;
        },
        getEdgeStrokeWidth(edge) {
            const srcInteract = edge.src.interact,
                dstInteract = edge.dst.interact
            const toBold = [srcInteract, dstInteract].every(interact => {
                return interact.highlightMode !== HighlightMode.NONE
            })
            // return 0.2
            return toBold ? 2.5 : 0.5
        },
        generateQueryColor(){
            let trend = this.getTrend(this.app.tasks)
            let maxCount = d3.max(trend, t => t.count)
            return this.getQueryColorTicks(trend, maxCount)
        },
        generateColorPropMap(){
            const ret = new Map()


            // cluster tasks by vertex
            const vertexTasksMap = new Map()
            this.taskList.forEach(task => {
                if (!vertexTasksMap.has(task.vertex.vid)) {
                    vertexTasksMap.set(task.vertex.vid, [])
                }
                vertexTasksMap.get(task.vertex.vid).push(task)
            })
            // console.log('vertexTasksMap', vertexTasksMap)

            // const taskListMap = new Map()   // layout node -> tasks
            // this.nodes.forEach(node => {
            //     const tasks = []
            //     node.data.vertexIdList.forEach(vertexName => {
            //         tasks.push(...vertexTasksMap.get(vertexName))
            //     })
            //     taskListMap.set(node.id, tasks)
            // })
            // console.log('taskListMap', taskListMap)

            const trendMap = new Map()
            Array.from(vertexTasksMap.entries()).forEach(entry => {
                  const [vid, tasks] = entry
                  const trend = this.getTrend(tasks)
                  trendMap.set(vid, trend)
            })
            // Array.from(taskListMap.entries()).forEach(entry => {
            //     const [nodeId, tasks] = entry
            //     const trend = this.getTrend(tasks)
            //     trendMap.set(nodeId, trend)
            // })
            const maxCount = d3.max(Array.from(trendMap.values()), trend => d3.max(trend, t => t.count))
            // console.log(maxCount)
            Array.from(trendMap.entries()).forEach(entry => {
                const [vid, trend] = entry
                let maxCount = d3.max(trend, t => t.count)
                ret.set(vid, this.getColorTicks(vid, trend, 100, maxCount))
            })
          return ret
        },
        changeGroupState(){
            this.app.tdagModel.isGroupAxis = !this.app.tdagModel.isGroupAxis
        },
    },
    watch: {
        queryBarLen(){
          d3.select(this.$el).select('.queryBar').select("rect")
              .attr('width', this.queryBarLen);
        },
        endTime(){
          this.newXScale = this.stateXScale;
          this.updateAxis();
          let ratio = (this.stateXScale.range()[1] - this.stateXScale.range()[0]) /
              (this.stateXScale.domain()[1] - this.stateXScale.domain()[0]);
          let queryBarLen = this.stateXScale.range()[1] - this.stateXScale.range()[0] - 1000*ratio;
          // this.queryBarLen = queryBarLen;
          d3.select(this.$el).select('.queryBar')
              .select("rect")
              .attr("width", queryBarLen)
        },
        axisUpdate(){
          let update = d3.select(this.$el).select(".grid")
            .selectAll("line")
            .data(this.bgLine);
          let enter = update.enter();
          enter.append("line")
            .attr("x1", d =>{
              return d;
            })
            .attr("y1", "0")
            .attr("x2", d =>{
                return d;
            })
            .attr("y2", this.svgHeight)
            .attr("style", "stroke:#ffffff;stroke-width:1.5; stroke-opacity: 1");
          update.attr("x1", d =>{
            return d;
          })
          .attr("y1", "0")
          .attr("x2", d =>{
                return d;
          })
          .attr("y2", this.svgHeight)
          .attr("style", "stroke:#ffffff;stroke-width:1.5; stroke-opacity: 1");
        },
        zoomScale(){
          if (this.app.tdagModel === undefined || this.app.tdagModel.zoomEventRatio === undefined)
            return
          this.$store.commit("comparison/updateTDAGView", {app:this.app,newVal:this.isGroupAxis});

          let zoomX = (this.stateXScale.range()[1] - this.stateXScale.range()[0]) * this.app.tdagModel.zoomEventRatio;
          let xOff = zoomX - this.app.tdagModel.zoomEventLen;
          this.curXOff -= xOff
          this.curRBound -= xOff
          this.paintLenRatio = (this.curRBound - (this.fixedBound)) / (this.stateXScale.range()[1] - this.stateXScale.range()[0]);

          let marginXOff = this.curXOff + 20;
          d3.select(this.$el).select('.progressContainer').attr('transform', 'translate(' + this.curXOff + "," + this.curYOff + ")");
          d3.select(this.$el).select('.timeAxis').attr('transform', 'translate(' + this.curXOff + ",20)");
          d3.select(this.$el).select('.queryBar').attr('transform', 'translate(' + marginXOff + ",25)");

          // console.log(this.zoomScale)
          // if (this.zoomScale <= 0){
          //   this.queryBarLen =  this.app.tdagModel.queryBarLen * Math.pow(2, this.zoomScale)
          // }else{
          //   this.queryBarLen = this.app.tdagModel.queryBarLen + this.app.tdagModel.queryBarLen * this.zoomScale;
          // }



          this.updateTimeAxis();

          this.$nextTick(() => this.updateSvgHeight());
        },
        tdagRenderSign() {
            render();
        },
        loaded() {
        },
        tdagTransform() {
            if (!this.tdagTransform) return
            this.svg.select('.progressContainer').attr('transform', this.tdagTransform);
            this.newXScale = this.tdagTransform.rescaleX(this.staticXScaleCopy);
            this.zoom.transform = this.tdagTransform
            this.updateAxis()
        },
        renderAxis() {
          this.updateTimeAxis()
        },
        isGroupAxis:function (newV, oldV){
          this.$store.commit("comparison/updateGroupedDomain", {app:this.app, newVal:newV, zoomXRatio: this.zoomEventRatio, paintLenRatio:this.paintLenRatio})
          // this.updateTimeAxis()
          // this.$store.commit("comparison/updateTDAGView", {app:this.app, newVal:newV})
        },
        globalDomainUpdate(){
          if (!this.isGroupAxis)
            return
          this.$store.commit("comparison/updateTDAGView", {app:this.app,newVal:this.isGroupAxis});
          this.curXOff = this.app.tdagModel.paintLenRatio * (this.app.xScale.range()[1] - this.app.xScale.range()[0]);
          this.curRBound = this.fixedBound + this.curXOff;
          let marginXOff = 20 + this.curXOff
          // console.log(this.app.queryName, this.curXOff)
          d3.select(this.$el).select('.progressContainer').attr('transform', 'translate(' + this.curXOff + "," + this.curYOff + ")");
          d3.select(this.$el).select('.timeAxis').attr('transform', 'translate(' + this.curXOff + ",20)");
          d3.select(this.$el).select('.queryBar').attr('transform', 'translate(' + marginXOff + ",25)");

          this.updateTimeAxis();

          this.$nextTick(() => this.updateSvgHeight());
        },

        ratioName(){
            this.stepSelectorIndex = this.getIndex(this.stepSelector, this.ratioName)
            this.generateColorPropMap()
        },
        dragTrigger(){
          if (this.dragTrigger){
            this.dragStart();
          }else{
            this.dragClose();
          }
        }
    },
    computed: {
        endTime(){
          if (this.app.tdagModel !== undefined) {
            // this.queryBarLen = this.app.tdagModel.queryBarLen;
            return this.app.tdagModel.endTime;
          }
          return 0;
        },
        queryBarLen(){
          if (this.app.tdagModel !== undefined) {
            let endTime = this.app.tdagModel.endTime;
            let groupEndTime = this.groupDomain[1];
            let ratio = !this.isGroupAxis || groupEndTime === 0 ? 1 : (endTime) /(groupEndTime)

            let ratioD = (this.stateXScale.range()[1] - this.stateXScale.range()[0]) /
                (this.stateXScale.domain()[1] - this.stateXScale.domain()[0]);
            let queryBarLen = this.app.tdagModel.queryBarLen - 1000*ratioD;
            // let queryBarLen = this.stateXScale.range()[1] - this.stateXScale.range()[0] - 1000*ratioD;
            // console.log(queryBarLen, this.app.tdagModel.queryBarLen)
            return queryBarLen * ratio;
          }
          else{
            return 0;
          }
        },
        queryBarMarginLeft(){
          if (this.app.tdagModel !== undefined)
            return this.app.tdagModel.xScale.range()[0];
          else{
            return 0;
          }
        },
        dragTrigger(){
          if (this.app.tdagModel !== undefined)
            return this.app.tdagModel.dragTrigger
          return false
        },
        tdagRenderSign() {
            return this.app.signs.tdagSign;
        },
        stepSelector(){
            return StepType.STEP_SELECTORS;
        },
        loaded() {
            return !!this.app.tdagModel;
        },
        ...mapState('comparison', {
            colorSchema: state => state.colorSchema,
            layoutConfig: state => state.layoutConfig,
            gapPixel: state => state.gapPixel,
            tdagTransform: state => state.tdagTransform,
            lastMove: state => state.lastMove,
            groupDomain: state => state.groupDomain,
            globalDomainUpdate: state=>state.globalDomainUpdate,
            zoomIn: state => state.zoomIn,
            zoomOut: state => state.zoomOut

        }),
        taskList() {
            return this.app.tasks
        },
        dagRoot() {
            return this.app.dagRoot
        },
        tdagCursorMode() {
            return this.app.tdagCursorMode
        },
        stateXScale() {
            return this.app.tdagModel.xScale
        },
        isGroupAxis(){
          if (this.app.tdagModel !== undefined)
            return this.app.tdagModel.isGroupAxis
          return false
        },
        zoomScale(){
          if (this.app.tdagModel !== undefined)
            return this.app.tdagModel.zoomScale
          // return 0
        },
        // tdagTransform() {
        //   return this.app.tdagTransform
        // },

        renderedVertexes() {
            return this.app.tdagModel.vertexes
                    .filter(v => v.toRender && !(v.layout.x === 0 && v.layout.y === 0));
        },

        renderAxis() {
          if (this.app.tdagModel !== undefined)
            return this.app.tdagModel.renderAxis
        },

        pathModels() {
            return this.app.tdagModel.edges
                .filter(e => e.toRender)
                .map(e => {
                    switch(e.layoutType) {
                        case TDAGLayoutType.DAGRE: {
                            // return {path: '', edge: e};

                            let offsetY = this.layoutConfig.vertexHeight / 2;
                            const srcLayout = e.src._tdagViewObj.layout,
                                    dstLayout = e.dst._tdagViewObj.layout;
                            let sx = srcLayout.x + srcLayout.width,
                                    sy = srcLayout.y + offsetY,
                                    dx = dstLayout.x,
                                    dy = dstLayout.y + offsetY
                            if (dx <= sx + this.gapPixel) {
                                dx = Math.min(dstLayout.x + dstLayout.width, sx + this.gapPixel)
                                dy += ((sy === dy) ? 0 : (sy < dy) ? -1 : 1) * offsetY;
                            }
                            dx = Math.max(sx, dx)
                            let points = [
                                [sx, sy],
                                [(sx + dx) / 2, sy],
                                [(sx + dx) / 2, dy],
                                [dx, dy]
                            ];
                            return {path: curveGen(points), edge: e, dx, dy}

                            // return {path: curveGen(e.dagrePoints), edge: e};
                        }

                        case TDAGLayoutType.TREE:
                            if (!e.isHidden) {
                                let offsetY = this.layoutConfig.vertexHeight / 2;
                                const srcLayout = e.src._tdagViewObj.layout,
                                        dstLayout = e.dst._tdagViewObj.layout;
                                let sx = srcLayout.x + srcLayout.width,
                                        sy = srcLayout.y + offsetY,
                                        dx = dstLayout.x,
                                        dy = dstLayout.y + offsetY;
                                if (e.turningX > dx) {
                                    dx = Math.min(e.turningX + this.gapPixel / 2, dx + dstLayout.width);
                                    dy += ((sy === dy) ? 0 : (sy < dy) ? -1 : 1) * offsetY;
                                    const middleX = Math.min(e.turningX, (sx + dx + dstLayout.width) / 2);
                                    let points = [
                                        [sx, sy],
                                        [middleX, sy],
                                        [middleX, dy],
                                        [dx, dy]
                                    ];
                                    return {path: curveGen(points), edge: e, dx, dy};
                                } else {
                                    let points = [
                                        [sx, sy],
                                        [e.turningX, sy],
                                        [e.turningX, dy],
                                        [dx, dy]
                                    ];
                                    return {path: curveGen(points), edge: e, dx, dy};
                                }

                            } else {
                                let offsetY = this.layoutConfig.vertexHeight / 2;
                                const srcLayout = e.src._tdagViewObj.layout,
                                        dstLayout = e.dst._tdagViewObj.layout;
                                let sx = srcLayout.x + srcLayout.width,
                                        sy = srcLayout.y + offsetY,
                                        dx = dstLayout.x,
                                        dy = dstLayout.y + offsetY
                                if (dx <= sx + this.gapPixel) {
                                    dx = Math.min(dstLayout.x + dstLayout.width, sx + this.gapPixel)
                                    dy += ((sy === dy) ? 0 : (sy < dy) ? -1 : 1) * offsetY;
                                }
                                dx = Math.max(sx, dx)
                                let points = [
                                    [sx, sy],
                                    [(sx + dx) / 2, sy],
                                    [(sx + dx) / 2, dy],
                                    [dx, dy]
                                ];
                                return {path: curveGen(points), edge: e, dx, dy}
                            }

                        default: {
                            let offsetY = this.layoutConfig.vertexHeight / 2;
                            const srcLayout = e.src._tdagViewObj.layout,
                                    dstLayout = e.dst._tdagViewObj.layout;
                            let sx = srcLayout.x + srcLayout.width,
                                    sy = srcLayout.y + offsetY,
                                    dx = dstLayout.x,
                                    dy = dstLayout.y + offsetY
                            if (dx <= sx + this.gapPixel) {
                                dx = Math.min(dstLayout.x + dstLayout.width, sx + this.gapPixel)
                                dy += ((sy === dy) ? 0 : (sy < dy) ? -1 : 1) * offsetY;
                            }
                            dx = Math.max(sx, dx)
                            let points = [
                                [sx, sy],
                                [(sx + dx) / 2, sy],
                                [(sx + dx) / 2, dy],
                                [dx, dy]
                            ];
                            return {path: curveGen(points), edge: e, dx, dy}
                        }
                    }
                });
        },

        colorPropMap() {
            return this.generateColorPropMap()
        },
        queryBarColor(){
          return this.generateQueryColor();
        },
        unfoldIconColor() {
            return this.tdagCursorMode === TDAGCursorMode.UNFOLD ? '#494949' : '#d9d9d9'
        },
        foldIconColor() {
            return this.tdagCursorMode === TDAGCursorMode.FOLD ? '#494949' : '#d9d9d9'
        },
        stepViewIconColor() {
            return this.app.showStepView ? '#494949' : '#d9d9d9'
        },
        stateXScaleRage() {
            return this.stateXScale?.range()
        },
        minTaskNoColor() {
            return colorGen(0)
        },
        maxTaskNoColor() {
            return colorGen(1)
        }
    }
}
</script>

<style scoped>
.button-group {
    /*position: absolute;*/
    /*left: 0;*/
    /*bottom: 0;*/
    /*margin: 10px;*/
    /*padding: 2px;*/
    /*float: right;*/
    /*border-radius: 4px;*/
    /*background: rgba(241, 241, 241, 0.62);*/

    position: absolute;
    right: 40px;
    top: -26px;
}

.icon {
    float: left;
    cursor: pointer;
    margin: 2px;
    border: rgba(255, 255, 255, 0) solid 1px;
    border-radius: 3px;
    transition: border 0.4s
}

.icon:hover {
    border: rgb(206, 206, 206) solid 1px;
}

.vertex-rect {
    cursor: pointer;
}
.svgContainer{
    border-style: solid;
    border-color: #d9d8d8;
    border-width: 0.2px;
    border-radius: 3px;
    width: calc(100% - 10px);
    /*height: calc(50% - 12px);*/
}
.progressContainer{
    -moz-user-select: none;
    user-select: none;
}
.timeAxis{
  -moz-user-select: none;
  user-select: none;
}

.checkbox-group >>> .el-radio-button__inner {
    padding: 4px 6px;
    font-size: 11px;
}

.checkbox-group {
    float: right;
    margin: 0 4px 5px 0;
}
</style>
