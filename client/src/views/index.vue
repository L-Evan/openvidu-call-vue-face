<template>
  <div class="dashboard-container">
    <div class="dashboard-text">欢迎您{{ name?","+name:"" }}!</div>
  </div>
</template>

<script>
import { mapGetters } from "vuex"

export default {
  ROUTER_ICON:"el-icon-eleme",
  ROUTER_TITLE:"首页",
  ROUTER_NAME: "index",
  computed: {
    ...mapGetters([
      "name"
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
