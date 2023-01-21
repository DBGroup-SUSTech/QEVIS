<template>
    <g>
        <line :x1="0" :y1="height / 2" :stroke="strokeColor"
              :x2="width" :y2="height / 2"
              stroke-width="1"></line>
        <rect :x="timeScale(start)" :stroke="strokeColor" stroke-width="1"
              :y="(height - barHeight) / 2"
              :height="barHeight"
              :fill="'none'"
              :width="timeScale(end) -timeScale(start)"
        ></rect>
        <circle :cx="timeScale(start)" :cy="height / 2"
                r="3" :fill="strokeColor"></circle>
        <circle :cx="timeScale(end)" :cy="height / 2"
                r="3" :fill="strokeColor"></circle>
    </g>
</template>

<script>
export default {
    name: "DurationBar",
    props:['height', 'width', 'timeScale', 'start', 'end', 'barHeight', 'strokeColor'],
    mounted(){

    }
}
</script>

<style scoped>

</style>