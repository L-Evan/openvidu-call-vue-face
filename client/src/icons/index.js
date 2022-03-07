import Vue from "vue"
import SvgIcon from "@/components/SvgIcon"// svg component
console.log("icon",SvgIcon)
// register globally
Vue.component("svg-icon", SvgIcon)

const req = require.context("./svg", false, /\.svg$/)
const requireAll = requireContext => requireContext.keys().map(requireContext)
requireAll(req)
