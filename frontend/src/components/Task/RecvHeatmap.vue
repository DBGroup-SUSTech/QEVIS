<template>
    <foreignObject :width="width" :height="height">
        <canvas ref="canvas" :width="width" :height="height"/>
    </foreignObject>
</template>

<script>
import {mapState} from "vuex";
import * as d3 from "d3";

const gap = 4
const emptyWidth = 10

export default {
    name: "RecvHeatmap",
    props: ['height', 'width', 'recv', 'rhRenderSign', 'machineId'],
    data() {
        return {
            recvMatrix: [],
            sideLen: 1,
            visBlocks: [],
            canvas: null,
            context: null,
            selfIdx: -1,
        }
    },
    mounted() {
        this.canvas = this.$refs.canvas
        this.context = this.canvas.getContext('2d')
    },
    methods: {
        computeRecvMatrix() {
            let recvMatrix = []
            this.machineList.forEach((machine, idx) => {
                let machineId = machine.machineId
                if (machineId === this.machineId) {
                    this.selfIdx = idx
                }
                if (!this.recv || this.recv[machineId] == undefined) {
                    recvMatrix.push([])
                } else {
                    let recvList = [...this.recv[machineId]]
                    recvList.sort((a, b) => b - a)
                    recvMatrix.push(recvList)
                }
            })
            this.recvMatrix = recvMatrix
        },
        computeSideLen() {
            let cnt = 0, maxFromOneMachine = 0
            this.recvMatrix.forEach(recvList => {
                maxFromOneMachine = Math.max(maxFromOneMachine, recvList.length)
                cnt += recvList.length
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
                this.recvMatrix.forEach(recvList => {
                    let len = recvList.length
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

            this.recvMatrix.forEach((recvList) => {
                let rects = []
                let block = {
                    x: x,
                    w: 0,
                    rects: rects,        // x, y, color
                    color: '#e7e7e7',
                }
                if (recvList.length === 0) {
                    x += emptyWidth
                } else {
                    let row = 0
                    for (let i = 0, iLen = recvList.length; i < iLen; i++) {
                        if (row >= rowCnt) {
                            row = 0
                            x += this.sideLen
                        }
                        rects.push({
                            x: x,
                            y: this.sideLen * row,
                            color: colorScale(recvList[i])
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
        rendering() {
            this.context.clearRect(0, 0, this.width, this.height)
            this.visBlocks.forEach((block, idx) => {
                this.context.fillStyle = block.color
                this.context.fillRect(block.x, 0, block.w, this.height)
                block.rects.forEach(rect => {
                    this.context.fillStyle = rect.color
                    this.context.fillRect(rect.x, rect.y, this.sideLen, this.sideLen)
                })
                if (idx === this.selfIdx) {
                    this.context.strokeStyle = 'black'
                    this.context.strokeRect(block.x, 0, block.w, this.height)
                }
            })
        },
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
            this.rendering()
        }
    },
    computed: {
        ...mapState('simulation', {
            colorSchema: state => state.colorSchema,
            machineList: state => state.machineList,
            maxCSize: state => state.maxCSize,
        }),
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
