import Vuex from "vuex"
import Vue from "vue"
import getters from "./getters"
import app from "./modules/app"
import settings from "./modules/settings"
import user from "./modules/user"
import permission from "./permission"
Vue.use(Vuex)

// <IRootState>
export default new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    permission
  },
  getters

})
