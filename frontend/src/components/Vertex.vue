<template>
    <g :transform="transform">
        <rect fill="grey" fill-opacity="0.5" stroke="black" :x="vertex.layout.x"
              :width="vertex.layout.width" :height="vertex.layout.height"
        ></rect>
        <g class="allStepContainer" :transform="stepContainerTransform">
            <rect v-for="step in vertex.steps" :key="step.name"
            :width="step.width" :height="nodeBarHeight" :x="step.x"
                  :fill="stepColorEncoding[step.name]">
                <title>{{vertex.vertex_name + ' - ' + step.name}}</title>
            </rect>
        </g>
    </g>
</template>

<script>
export default {
    name: "Vertex",
    props: ['vertex', 'nodeContainerHeight', 'nodeBarHeight', 'stepColorEncoding'],
    mounted() {
        console.log('vertex', this.vertex)
    },
    methods:{},
    computed:{
        transform(){
            return 'translate(' + [0, this.vertex.layout.y] + ')'
        },
        stepContainerTransform(){
            return 'translate(' + [this.vertex.layout.x,
                (this.nodeContainerHeight - this.nodeBarHeight) / 2] + ')'
        }
    }
}
</script>

<style scoped>

</style>