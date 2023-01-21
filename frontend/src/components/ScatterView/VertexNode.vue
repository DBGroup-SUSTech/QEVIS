<template>
    <g>
        <line style="stroke:purple; stroke-width:0.5" v-if="vertex.layout.selected == true"
              :x1="vertex.layout.mX" :y1="vertex.layout.mY"
              :x2="vertex.layout.mX" :y2="vertex.layout.mX"
        />
        <g :transform="transform" @mouseover="mouseover" @mouseout="mouseout">
            <rect class="glyph" v-if="shape=='rect'" :width="size-2" :height="size-2" :fill="fill"
                  :opacity="opacity"
                  x="-3" y="-3"></rect>
            <circle class="glyph" v-if="shape=='circle'" :r="size/2" :fill="fill"
                    :opacity="opacity"
            ></circle>
        </g>
    </g>
</template>

<script>
export default {
    name: "VertexNode",
    props: ['vertex'],
    data() {
        return {
            size: 10,
        }
    },
    computed: {
        transform() {
            return 'translate(' + [this.vertex.layout.mX, this.vertex.layout.mY] + ')'
        },
        shape() {
            if (this.vertex.hvType == 'Map') {
                return 'rect'
            } else {
                return 'circle'
            }
        },
        fill() {
            if (this.vertex.layout.selected == false) {
                return 'grey'
            } else {
                return 'purple'
            }
        },
        opacity() {
            if (this.vertex.layout.selected == false) {
                return 0.2
            } else {
                return 1
            }
        }
    },
    methods: {
        mouseover() {
            this.$store.commit('simulation/hoverVertex', this.vertex);
            this.opacity = 1;
        },
        mouseout() {
            this.opacity = 0.2;
            this.$store.commit('simulation/hoverOutVertex', this.vertex);
        }
    }

}
</script>

<style scoped>

</style>