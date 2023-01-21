<template>
    <g>
        <g  v-for="(block, idx) in visBlocks" :key="'b'+idx">
            <rect :x="block.x" :y="0" :width="block.w" :height="height" :fill="block.color"/>
            <rect v-for="(rect, idx) in block.rects" :key="'r'+idx"
                  :x="rect.x" :y="rect.y" :width="sideLen" :height="sideLen" :fill="rect.color"
                  @mouseover="mouseOverRect(rect)" @mouseleave="mouseLeaveRect(rect)"
                  @click="clickRect(rect)"
            />
            <rect v-if="idx===selfIdx" :x="block.x" :y="0" :width="block.w" :height="height"
                  fill="none" stroke="black" stroke-width="1.5"/>
        </g>
    </g>
</template>

<script>
import {mapState} from "vuex";
import * as d3 from "d3";

const gap = 4
const emptyWidth = 10

export default {
    name: "RecvHeatmapSvg",
    props: ['height', 'width', 'task', 'type', 'rhRenderSign', 'machineId'],
    data() {
        return {
            recvMatrix: [],
            sideLen: 1,
            visBlocks: [],
            selfIdx: -1,
        }
    },
    methods: {
        computeRecvMatrix() {
            let recvMatrix = []
            this.machineList.forEach((machine, idx) => {
                let machineId = machine.machineId
                if (machineId === this.machineId) {
                    this.selfIdx = idx
                }
                if (!this.transfer || this.transfer[machineId] == undefined) {
                    recvMatrix.push([])
                } else {
                    let recvList = [...this.transfer[machineId]]
                    recvList.sort((a, b) => b.csize - a.csize)
                    recvMatrix.push(recvList)
                }
            })
            this.recvMatrix = recvMatrix
        },
        computeSideLen() {
            let cnt = 0, maxFromOneMachine = 0
            this.recvMatrix.forEach(recvInfos => {
                maxFromOneMachine = Math.max(maxFromOneMachine, recvInfos.length)
                cnt += recvInfos.length
            })

            if (cnt === 0) {
                this.sideLen = 1
                return
            }

            let sideLen
            let lo = 1, hi = maxFromOneMachine
            while (lo <= hi) {
                let mi = lo + Math.floor((hi - lo) / 2)
                sideLen = this.height / mi

                // check valid
                let widthRequest = gap * (this.recvMatrix.length - 1)
                this.recvMatrix.forEach(recvInfos => {
                    let len = recvInfos.length
                    if (len === 0) {
                        widthRequest += emptyWidth
                    } else {
                        widthRequest += Math.ceil(len / mi) * sideLen
                    }
                })

                if (widthRequest > this.width) {
                    lo = mi + 1
                } else {
                    hi = mi - 1
                }
            }
            // if (lo >= maxFromOneMachine) {
            //     console.error('fail to compute sideLen')
            //     return 1
            // }
            // now hi is the row cnt
            this.sideLen = this.height / lo
        },
        computeVisBlocks() {
            let visBlocks = []
            let x = 0, rowCnt = Math.round(this.height / this.sideLen)

            let colorScale = d3.scaleSequential(d3["interpolate" + 'YlOrRd']).domain([0, this.maxCSize]);

            this.recvMatrix.forEach((recvInfos) => {
                let rects = []
                let block = {
                    x: x,
                    w: 0,
                    rects: rects,        // x, y, color
                    color: '#e7e7e7',
                }
                if (recvInfos.length === 0) {
                    x += emptyWidth
                } else {
                    let row = 0
                    for (let i = 0, iLen = recvInfos.length; i < iLen; i++) {
                        let recvInfo = recvInfos[i]
                        if (row >= rowCnt) {
                            row = 0
                            x += this.sideLen
                        }
                        rects.push({
                            x: x,
                            y: this.sideLen * row,
                            color: colorScale(recvInfo.csize),
                            type: this.type,
                            fetchInfo: recvInfo,
                        })
                        row += 1
                    }
                    x += this.sideLen
                }
                block.w = x - block.x
                visBlocks.push(block)
                x += gap
            })
            this.visBlocks = visBlocks
        },
        mouseOverRect(rect) {
            rect.fetchInfo.dstTask.layout.selected = true
            rect.fetchInfo.srcTask.layout.selected = true
        },
        mouseLeaveRect(rect) {
            rect.fetchInfo.dstTask.layout.selected = false
            rect.fetchInfo.srcTask.layout.selected = false
        },
        clickRect(rect) {
            console.log('click', rect.fetchInfo.srcTask.vec_name, rect.fetchInfo.dstTask.vec_name)
        }
    },
    watch: {
        rhRenderSign() {
            // console.log('>>> 0', this.recv)
            this.computeRecvMatrix()
            // console.log('>>> 1', this.recvMatrix)
            this.computeSideLen()
            // console.log('>>> 2', this.sideLen)
            this.computeVisBlocks()
            // console.log('>>> 3', this.visBlocks)
        }
    },
    computed: {
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema,
            machineList: state => state.machineList,
            maxCSize: state => state.maxCSize,
        }),
        transfer() {
            return this.task[this.type]
        }
        // recvMatrix() {
        //     let ret = []
        //
        //     return ret
        // },
    }
}
</script>

<style scoped>

</style>
