<template>
  <div>
   <div class="aui-content-box">
    <div class="aui-yes">
        <img src="@/asset/jsp/img/yes.png" alt="">
    </div>
    <h1>数据录入成功</h1>
    <p>如有疑问可联系管理人员</p>
    <button @click="goBack()" >点击返回页面</button> 
</div>
  </div>
</template>
<script>
// import Api from "@/api/message/message"
// import Api from "@/api/kb" 

import CommonPage from "@/lib/utils/mixin/CommonPage"
export default {
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "成功页面",
  ROUTER_NAME: "success", 
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
  mixins:[CommonPage]
}
</script>

<style src="@/asset/jsp/style/style3.css"  scoped></style>
 

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