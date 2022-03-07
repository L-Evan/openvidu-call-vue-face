<template>
  <div>
    <iframe :src="url" height="100%" width="100%" id="frame_full" frameborder="0" scrolling="auto" ></iframe>
 
  </div>
</template>
<script>
// import Api from "@/api/message/message"
// import Api from "@/api/kb" 

import CommonPage from "@/lib/utils/mixin/CommonPage"
export default {
  mixins:[CommonPage],
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "报表导出",
  ROUTER_NAME: "test", 
  ROUTER_HIDDEN:true,
  data() { 
    return {
      url:"http://localhost:8082/FileSelect"
    }
  },
  created: function () {},
  mounted() {},
  methods: {
     
  },
}
</script>

<style src="@/../node_modules/bootstrap/dist/css/bootstrap.min.css"  scoped></style>

<style>
.amap-page-container {
  position: relative;
  width: 100%;
  margin-top: 0.03rem;
  height: 500px;
  font-size: 0.12rem;
  color: #fff;
}
</style> 