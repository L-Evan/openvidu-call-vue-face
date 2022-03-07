<template>
  <div>
    <el-table :data="messages" height="650" style="width: 100%">
      <el-table-column
        prop=""
        label=""
        width="100"
        header-align="center"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="email"
        label="邮箱"
        width="200"
        header-align="center"
        align="center"
      >
      </el-table-column>
      <el-table-column
        prop="reciver"
        label="用户"
        width="200"
        header-align="center"
        align="center"
      >
      </el-table-column>
      <el-table-column prop="info" label="信息" header-align="center">
      </el-table-column>
    </el-table>
  </div>
</template>
         

<script src="@/../node_modules/bootstrap/dist/js/bootstrap.min.js"   ></script>
<script>
import Api from "@/api/message/message";
import message from "@/api/message/message";
// import Api from "@/api/kb"
export default {
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "消息通知",
  ROUTER_NAME: "send",
  data() {
    return {
      dialogFormVisible: false,
      messages: [],
      sendform: {
        toEmail: [],
        title: "",
        info: "",
      },
      status: 1,
    };
  },
  created: function () {},
  mounted() {
    /*
    * created页面加载未渲染html之前执行。
        mounted渲染html后再执行。
    * */
    this.showMessage();
  },
  methods: {
    async showMessage() {
      const res = await Api.showAllMessage();
      console.log("数据", res);
      this.messages = res.message;
      console.log("messages", this.messages);
    }
  },
};
</script>

  <style src="@/../node_modules/bootstrap/dist/css/bootstrap.min.css"  scoped></style>

<style type="text/css">
</style>