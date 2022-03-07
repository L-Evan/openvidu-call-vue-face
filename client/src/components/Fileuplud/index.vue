<template>
  <div id="main">
    <div style="overflow: hidden">
      <el-upload
        class="upload-demo"
        :on-success="success"
        :on-error="error"
        drag
        ref="upload"
        :limit="1"
        :auto-upload="false"
        :headers="headers"
        :action="action"
        multiple
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div class="el-upload__tip" slot="tip">
          只能上传标准教务课表的excel文件
        </div>
      </el-upload>
    </div>
    <!-- <el-button
      style="margin-left: 10px"
      size="small"
      type="success"
      @click="submitUpload"
      >上传到服务器</el-button
    > -->
  </div>
</template>
<script>
import CommonPage from "@/lib/utils/mixin/CommonPage"

export default {
  props: {
    action: String,
  },
  data() {
    return {
      headers: {
        "x-authorization": "",
      },
      name: "哈哈哈",
    }
  },
  created() {
    this.headers["x-authorization"] = this.token
    console.log(this.name, "?", this.token, this.headers)
  },
  methods: {
    success(data){
      console.log("上传成功？",data)
      this.$emit("success",data)
    },
    error(data){
      this.$emit("error",data)
    },
    submitUpload() {
      this.$refs.upload.submit()
    },
  },
  ROUTER_NAME: "upload",
  ROUTER_TITLE: "上传文件",
  mixins: [CommonPage],
}
</script>
<style scoped>
.upload-demo >>> .el-icon-document {
  height: 2rem;
  line-height: 1.5rem;
}
</style>
