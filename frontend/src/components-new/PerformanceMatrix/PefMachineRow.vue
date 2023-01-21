<template>
    <g>
        <g v-for="(vec, index) in vecNameList"
           :key="index"
           :transform="'translate(' + [index * colWidth, 0] + ')'">
            <PerfCell
                    :rowHeight="rowHeight"
                    :colWidth="colWidth"
                    :app="app"
                    :vecName="vec"
                    :vertexNameMap="vertexNameMap"
                    :data="data[vec]"
                    :machineId = "machineId"
                    :diagnoseParamMatrix="diagnoseParamMatrix"
                    :perShowList="perShowList"
            ></PerfCell>

        </g>
    </g>
</template>

<script>

import PerfCell from "@/components-new/PerformanceMatrix/PerfCell";
export default {
    name: "PerformanceUnit",
    components:{PerfCell},
    props:[
        'colWidth', 'rowHeight', 'vecNameList',
        'data', 'app', 'vertexNameMap', 'machineId',
        "diagnoseParamMatrix","perShowList"
    ],
    mounted(){},
    computed:{},
    methods:{},
    watch:{
    perShowList(){
      // alert(1)
    }
  },

}
</script>

<style scoped>

</style>
