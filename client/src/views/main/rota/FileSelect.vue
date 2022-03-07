<template>
  <div>
    <div id="app">
<form id="contant-form" class="form" name="contact-form" >
    <h1 class="form__headline">报表导出</h1>

    <div class="form__group">
        <p class="form__group-header">
            <label class="form__group-label" for="outType">导出表类型</label>
        </p>
        <div class="form__group-content">
            <div class="form__select-box">
                <div class="select-box">
                    <select id="outType" class="select-box__body" name="outType" title="请务必选择指定教学楼" required>
                        <option value="" disabled selected hidden>选择需导出表类型</option>
                        <option value="repair">维修表</option>
                    </select>
                </div>
            </div>
            <p class="form__validation" data-validation="address-level1" role="alert" aria-live="assertive"></p>
        </div>
    </div>

    <div class="form__group">
        <p class="form__group-header">
            <label class="form__group-label" >开始统计日期</label>
        </p>
        <div class="form__group-content">
            <div class="form__text-input">
                <p class="text-input">
                    <input id="start" class="text-input__body" type="date" name="family-name"  required>
                    <span class="text-input__validator"></span>
                </p>
            </div>
            <p class="form__validation" data-validation="datetime" role="alert" aria-live="assertive"></p>
        </div>
        <input name="startTime" style="display: none" value="" id="index">
    </div>

    <div class="form__group">
        <p class="form__group-header">
            <label class="form__group-label">结束统计日期</label>
        </p>
        <div class="form__group-content">
            <div class="form__text-input">
                <p class="text-input">
                    <input id="end" class="text-input__body" type="date" name="family-name"  required>
                    <span class="text-input__validator"></span>
                </p>
            </div>
            <p class="form__validation" data-validation="datetime" role="alert" aria-live="assertive" ></p>
        </div>
        <input name="endTime" style="display: none" value="" id="index2">
    </div>

    <div id="a" class="form__group">
        <p class="form__group-header">
            <label class="form__group-label" for="place">教学楼</label>
        </p>
        <div class="form__group-content">
            <div class="form__select-box">
                <div class="select-box">
                    <select id="place" class="select-box__body" name="place" title="请务必选择指定教学楼" required @change="show()">
                        <option value="" disabled selected hidden>选择需导出的教学楼</option>
                        <option value="明德楼">明德楼</option>
                        <option value="知行楼">知行楼</option>
                    </select>
                </div>
            </div>
            <p class="form__validation" data-validation="address-level1" role="alert" aria-live="assertive"></p>
        </div>
    </div>

    <div id="b" class="form__group">
        <p class="form__group-header">
            <label class="form__group-label" for="classRoom">导出房间</label>
        </p>
        <div class="form__group-content">
            <div class="form__select-box">
                <div class="select-box">
                    <select id="classRoom" class="select-box__body" name="classRoom" title="请务必选择指定教学楼" required>
                        <option value="" disabled selected hidden>选择需导出房间</option>
                    </select>
                </div>
            </div>
            <p class="form__validation" data-validation="address-level1" role="alert" aria-live="assertive"></p>
        </div>
    </div>


    <div id="form__group-content" align="center" style="margin: 20px;">
        <input type="button" value="导出" class="file-select__button" @click="greet()" >
        <label class="file-select__button">返回</label>
    </div>
</form>
</div>
<div id="s1"></div>

  </div>
</template>

<script src="@/asset/jsp/js/focus-visible.min.js"></script>
<script src="@/asset/jsp/js/moment.min.js"></script>
<script src="@/asset/jsp/js/ajaxzip3.js"></script>
<script src="@/asset/jsp/js/script.js"></script>

<script>
import Api from "@/api/rota/rota.js"


import CommonPage from "@/lib/utils/mixin/CommonPage"
// import Api from "@/api/kb" 
export default {
  mixins:[CommonPage],
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "维修表单",
  ROUTER_NAME: "test", 
  data() { 
    return {
      item:"" , 
    }
  },
  created: function () {},
  mounted() {},
  methods: {
    async greet() {
      this.show2()
      var startTime=document.getElementById("start").value
      var endTime=document.getElementById("end").value
      var place=document.getElementById("place").value
      var classRoom=document.getElementById("classRoom").value

      console.log(startTime)
      console.log(endTime)
      console.log(place)
      console.log(classRoom)
      const data = {
        "place":place,
        "startTime":startTime,
        "endTime":endTime,
        "classRoom":classRoom,
      } 
      //alert(startTime+" "+endTime+" "+place+" "+classRoom);
      const res = await Api.testOutput(data)

      console.log(res)
      var item = res.outPut
      this.item=item
      sessionStorage.setItem("key", JSON.stringify(item))
      console.log("设置导出的数据：",item)
      this.goPage("ouputrepair")
    //   window.location.href=("outPut")
       
    },
    show() {
      var a = document.getElementById("place")
      var gSelectID = []
      var zSelectID = []
      var classRoom = document.getElementById("classRoom")
      classRoom.options.length=0
      gSelectID.pop()
      if (a.value == "明德楼") {
        gSelectID.push("MA305")
        gSelectID.push("MA306")
        for (var i in gSelectID) {
          let option = document.createElement("option") // 创建option元素
          option.appendChild(document.createTextNode(gSelectID[i]))
          option.setAttribute("value", gSelectID[i])
          classRoom.appendChild(option)
        }
      }
      if (a.value == "知行楼") {
        zSelectID.push("ZA305")
        zSelectID.push("ZA306")
        for (let i in zSelectID) {
          let option = document.createElement("option") // 创建option元素
          option.appendChild(document.createTextNode(zSelectID[i]))
          option.setAttribute("value", zSelectID[i])
          classRoom.appendChild(option)
        }
      }
    }, 
    show2(){
      let s=$("#start")[0]
      let e=$("#end")[0]
      let startTime = $("#index")[0]
      let endTime = $("#index2")[0]
      startTime.value=s.value
      endTime.value=e.value
      if(startTime.value>endTime.value){
        alert("结束日期需在开始日期前！")
      }

      //let a=$("#outType")
      //let b=$("#place")
      //let c=$("#classRoom")
      //alert(startTime.value+" "+endTime.value+" "+a.value+" "+b.value+" "+c.value);
    }
  },
}
</script>

<style src="@/../node_modules/bootstrap/dist/css/bootstrap.min.css"  scoped></style>

<style src="@/asset/jsp/style/normalize.min.css"  scoped></style>
<style src="@/asset/jsp/style/flatpickr.min.css"  scoped></style>
<style src="@/asset/jsp/style/style2.css"  scoped></style>
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