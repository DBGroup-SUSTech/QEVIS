import VueRouter from 'vue-router'
import Simulation from "@/views/Simulation";
import TestView from "@/views/TestView";
import Comparison from "@/views/Comparison";

const routes = [
    {path: '/simulation', component: Simulation},
    {path: '/comparison', component: Comparison},
    {path: '/test', component: TestView},
    {path: '/', redirect: '/comparison'},
]

export default new VueRouter({
    mode: 'history',
    routes
})
