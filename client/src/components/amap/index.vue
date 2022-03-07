<template>
  <div>
    <!-- <iframe :src="url" height="100%" width="100%" id="frame_full" frameborder="0" scrolling="auto" ></iframe> -->
    <el-amap
      vid="amap"
      :plugin="plugin"
      :zooms="zooms"
      :center="centspoint"
      resizeEnable="false"
      @error="onError"
      @complete="onComplete"
    ></el-amap>
  </div>
</template>
<script>
// import Api from "@/api/message/message"
// import Api from "@/api/kb"
export default {
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "boot",
  ROUTER_NAME: "test",
  data() {
    let self = this
    return {
      loaded: false,
      lng: 0,
      lat: 0,
      plugin: [
        //一些工具插件
        {
          pName: "Geolocation", //定位
          events: {
            init(o) {
              console.log("获取定位", o)
              // o 是高德地图定位插件实例
              o.getCurrentPosition((status, result) => {
                console.log(status, "状态")
                if (status == "error") {
                  self.onError(result)
                } else if (result && result.position) {
                  self.lng = result.position.lng //设置经度
                  self.lat = result.position.lat //设置维度
                  self.center = [self.lng, self.lat] //设置坐标
                  console.log("得到定位")
                  self.onComplete(result)
                  self.loaded = true //load
                  self.$nextTick() //页面渲染好后
                }
              })
            },
          },
        },
      ],
      zooms: [11, 11],
      centspoint: [116.397428, 39.90923],
    }
  },
  created: function () {},
  mounted() {},
  methods: {
    //解析定位结果
    onError(data) {
      this.$message({
        type: "info",
        message: "定位失败: 请联系管理员2！",
      })
      window.close()
    }, 
    onComplete(data) {
      var str = ["定位成功"]
      //获取当前地址
      //所在省
      var province = data.addressComponent.province
      //所在城市
      var city = data.addressComponent.city
      if (city.length == 0) {
        str.push("所在城市：" + province)
      } else {
        str.push("所在省：" + province)
        str.push("所在城市：" + city)
      }
      //所在区
      var district = data.addressComponent.district
      str.push("所在地区：" + district)
      //所在乡镇
      var township = data.addressComponent.township
      str.push("所在乡镇：" + township)
      //格式化地址
      var formattedAddress = data.formattedAddress
      str.push("详细地址：" + formattedAddress)

      //获取当前经度纬度
      str.push("经度：" + data.position.getLng())
      str.push("纬度：" + data.position.getLat())
      if (data.accuracy) {
        str.push("精度：" + data.accuracy + " 米")
      } //如为IP精确定位结果则没有精度信息
      str.push("是否经过偏移：" + (data.isConverted ? "是" : "否"))
      // document.getElementById("tip").innerHTML = str.join("<br>")
      //弹窗(详细信息)
      if (formattedAddress != null) {
        this.$message({
          type: "info",
          message: `详细地址: ${formattedAddress}`,
        })
        localStorage.setItem("locate", formattedAddress)
        window.close()
      } else {
        alert("请联系管理员1！")
        window.close()
      }
    },
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