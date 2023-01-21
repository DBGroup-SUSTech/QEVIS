import Vue from 'vue'
import Vuex from 'vuex'
import simulation from "@/store/modules/simulation";
import comparison from "@/store/modules/comparison";

Vue.use(Vuex)

// const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
    modules: {
        simulation,
        comparison,
    },
    // strict: debug,
    strict: false,
})
