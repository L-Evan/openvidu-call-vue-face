<template>
  <div class="wrapper">
    <div
      style="height: calc(100% - 50px); line-height: 80vh; display: list-item"
    >
      <el-form
        style="text-align: center"
        :inline="true"
        :model="form"
        class="demo-form-inline"
      >
        <el-form-item label="会议号">
          <el-input
            v-model="form.sessionName"
            placeholder="请输入会议号"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSessionName()"
            >进入会议</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  ROUTER_NAME: "meet",
  ROUTER_TITLE: "视频会议",
  ROUTER_ICON: "el-icon-date",
  name: "meet",
  data() {
    return {
      form: { sessionName: "" },
    }
  },
  mounted() {
    var num = ""
    for (var i = 0; i < 10; i++) {
      num += Math.floor(Math.random() * 10)
    }
    this.form.sessionName = num
  },
  methods: {
    handleSessionName() {
      if(this.form.sessionName.length<6){
        this.$message({
          message: "会议号不能少于6位",
          type: "warning"
        })
        return 
      }
      this.$router.push({
        path: "/openvidu",
        query: { sessionName: this.form.sessionName },
      })
    },
  },
}
</script>

<style>
.wrapper {
  background: #000000
    url("https://pig-blog-1252563418.cos.ap-chengdu.myqcloud.com/img/blog/6251400d1bcc2dc11708256c7c4d67d.jpg");

  background-attachment: fixed;

  background-repeat: no-repeat;

  background-position: center center;

  background-size: cover;

  overflow: hidden;
  height: calc(100% - 50px);
}
</style>