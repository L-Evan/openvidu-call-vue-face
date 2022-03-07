<template>
  <div>
    <div class="container" id="box">
      <h2 align="center">
        维修表信息记录
        <a href="" id="dd"
          ><input type="button" value="导出" class="btn btn-primary"
        /></a>
      </h2>

      <table ref="puttable" class="table table-bordered table-hover" id="s1">
        <tr>
          <th class="text-center" style="width: 5%">序号</th>
          <th class="text-center" style="width: 5%">维修人员</th>
          <th class="text-center" style="width: 10%">联系方式</th>
          <th class="text-center" style="width: 5%">教学楼</th>
          <th class="text-center" style="width: 5%">教室</th>
          <th class="text-center" style="width: 10%">维修内容</th>
          <th class="text-center" style="width: 10%">维修时间</th>
          <th class="text-center" style="width: 25%">详情</th>
        </tr>

        <tbody>
          <tr class="text-center" :key="index" v-for="(item2, index) in myData">
            <td>{{ index }}</td>
            <td>{{ item2.rname }}</td>
            <td>{{ item2.tel }}</td>
            <td>{{ item2.place }}</td>
            <td>{{ item2.rClassroom }}</td>
            <td>{{ item2.rContext }}</td>
            <td>{{ item2.rTime }}</td>
            <td>{{ item2.rSolution }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="target">
      <a href="" style="color: white">返回管理页面</a>
    </div>
  </div>
</template>
<script>
// import Api from "@/api/message/message"
// import Api from "@/api/kb"

export default {
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "维修记录表导出",
  ROUTER_NAME: "ouputrepair",
  ROUTER_HIDDEN: true,
  data() {
    return {
      myData: [],
    }
  },
  created: function () {},
  mounted() { 
    this.test()
    // 使用outerHTML属性获取整个table元素的HTML代码（包括<table>标签），然后包装成一个完整的HTML文档，设置charset为urf-8以防止中文乱码
    this.$nextTick(()=>{
      var html =
      "<html><head><meta charset='utf-8' /></head><body>" +
      document.getElementsByTagName("table")[0].outerHTML +
      "</body></html>"
      console.log(html,this.$refs["puttable"])
      // 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
      var blob = new Blob([html], { type: "application/vnd.ms-excel" })
      var a = document.getElementById("dd")
      // 利用URL.createObjectURL()方法为a元素生成blob URL
      a.href = URL.createObjectURL(blob)
      // 设置文件名
      a.download = "维修表.xls"
    })
  },
  methods: {
    test() {
      var item = sessionStorage.getItem("key")
      //alert(item);
      //console	.log(item);
      var item2 = JSON.parse(item)
      //转换为json对象
      //alert(item2[0].place);
      this.myData = item2
      console.log("要导出的",item2)
    },
  },
}
</script>

<style src="@/../node_modules/bootstrap/dist/css/bootstrap.min.css"  scoped></style>

<style scoped>
.container {
  width: 90%;
  margin: auto;
  margin-top: 20px;
  background-color: white;
}
body {
  background-color: #6c6c6c;
}
.target {
  width: 100%;
  font-size: 15px;
  font-weight: bolder;
  margin: auto;
  text-align: center;
  margin-top: 10px;
}
</style> 