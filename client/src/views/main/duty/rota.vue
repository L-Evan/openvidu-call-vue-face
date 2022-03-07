<template>
  <div>
    <div id="app">
      <div style="width: 1000px; margin: 0 auto">
        <h1 class="titleH1 underNone clearfix">
          <span class="left underNone underLine">实验室值班表</span>
        </h1>
        <div class="selectmsg">
          <label>学期：</label>
          <select name="term" id="term">
            <option value="none" selected disabled hidden>请选择</option>
            <option value="2020-2021-2">2020-2021-2</option>
            <option value="2020-2021-1">2020-2021-1</option>
            <option value="2019-2020-2">2019-2020-2</option>
            <option value="2019-2020-1">2019-2020-1</option>
            <option value="2018-2019-2">2018-2019-2</option>
            <option value="2018-2019-1">2018-2019-1</option>
          </select>

          <label>地点：</label>
          <select name="place" id="place">
            <option value="none" selected disabled hidden>请选择</option>
            <option value="明德楼">明德楼</option>
            <option value="知行楼">知行楼</option>
          </select>

          <label>学习周：</label>
          <select name="stuWeek" id="stuWeek">
            <option value="none" selected disabled hidden>请选择</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
          </select>
          
            <button class="check" v-on:click="greet(1)">查看</button>
            <a href='' id='dd'> <button class="check" @click="outPut">导出</button></a>
        </div>

        <div class="jyTable" style="margin-bottom: 20px">
          <div
            class="clearfix"
            style="background-color: #87cefa; margin-bottom: 20px"
          >
            <input name="weeks" style="display: none" value="" id="index" />
            <input
              type="submit"
              v-on:click="greet(1)"
              value="周一"
              class="bt"
            />
            <input
              type="submit"
              v-on:click="greet(2)"
              value="周二"
              class="bt"
            />
            <input
              type="submit"
              v-on:click="greet(3)"
              value="周三"
              class="bt"
            />
            <input
              type="submit"
              v-on:click="greet(4)"
              value="周四"
              class="bt"
            />
            <input
              type="submit"
              v-on:click="greet(5)"
              value="周五"
              class="bt"
            />
            <input
              type="submit"
              v-on:click="greet(6)"
              value="周六"
              class="bt"
            />
            <input
              type="submit"
              v-on:click="greet(7)"
              value="周日"
              class="bt"
            />
          </div>
          <div class="zong">
            <div class="list list1">
              <div class="tabCon">
                <ul>
                  <li class="tabth clearfix">
                    <span style="width: 12%">时间</span>
                    <span style="width: 12%">地点</span>
                    <span style="width: 12%">教室</span>
                    <span style="width: 12%">课程</span>
                    <span style="width: 12%">任课老师</span>
                    <span style="width: 12%">值班人员</span>
                    <span style="width: 12%">联系方式</span>
                    <span style="width: 12%">点击签到</span>
                  </li>
                </ul>
                <div>
                  <ul class="tabUl" id="s1">
                    <li
                      class="tabtr clearfix"
                      v-for="(item, index) in items"
                      :key="index"
                    >
                      <span style="width: 12%; color: #f7001e">
                        {{ item.classTime }}
                      </span>
                      <span style="width: 12%; color: #ab9c08">
                        {{ item.place }}
                      </span>
                      <span style="width: 12%; color: #067d14">
                        {{ item.classRoom }}
                      </span>
                      <span style="width: 12%"> {{ item.course }} </span>
                      <span style="width: 12%"> {{ item.techerName }} </span>
                      <span style="width: 12%"> {{ item.stuName }} </span>
                      <span style="width: 12%"> {{ item.tel }} </span>
                      <a style="width: 12%; color: #f7001e"
                        ><em @click="goSign()"  class="clickbtn hot">签到</em></a
                      >
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style="
          text-align: center;
          margin: 10px 0;
          font: normal 14px/24px 'MicroSoft YaHei';
        "
      >
        <p>适用于北京理工大学珠海学院实验室</p>
        <p><a href="http://zs.bdqn.cn/" target="_blank">返回主页</a></p>
      </div>
    </div>
    <table
      class="table table-bordered table-hover"
      id="s2"
      style="display: none"
    >
      <tr>
        <th class="text-center" style="width: 5%">上课节数</th>
        <th class="text-center" style="width: 5%">地点</th>
        <th class="text-center" style="width: 10%">教室</th>
        <th class="text-center" style="width: 5%">课程</th>
        <th class="text-center" style="width: 10%">任课老师</th>
        <th class="text-center" style="width: 10%">值班人员</th>
        <th class="text-center" style="width: 25%">联系方式</th>
      </tr>
      <tr v-for="(item,index) in items" :key="index">
        <td>
           {{ item.classTime }}
        </td>
        <td>
           {{ item.place }}
        </td>
        <td>
           {{ item.classRoom }}
        </td>
        <td>
           {{ item.course }}
        </td>
        <td>
           {{ item.techerName }}
        </td>
        <td>
           {{ item.stuName }}
        </td>
        <td>
           {{ item.tel }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script type="text/javascript" src="@/asset/jsp/js/tab.js"></script>   
<!-- script src="/demos/googlegg.js"></script -->
<style  src="@/asset/jsp/style/common.css" scoped>
</style>
<style  src="@/asset/jsp/style/style.css" scoped>
</style>
<script>
import Api from "@/api/rota/rota.js";
// import Api from "@/api/kb"

import CommonPage from "@/lib/utils/mixin/CommonPage"
export default {
  mixins:[CommonPage],
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "值班表格",
  ROUTER_NAME: "test",
  data() {
    return {
      items: [],
      url: "http://localhost:8082/FileSelect",
    };
  },
  created: function () {},
  mounted() {},
  methods: {
    goSign(){
      this.goPage("message")
    },
    show(num) {
      var a = $("index");
      var term = $("term");
      var place = $("place");
      var stuWeek = $("stuWeek");
      if (
        place.value == 'selected="selected"' ||
        stuWeek.value == 'selected="selected"' ||
        term.value == 'selected="selected"'
      ) {
        alert("您有选项未选择！");
      } else {
        a.value = num;
      }
    },
    outPut() {
      // 使用outerHTML属性获取整个table元素的HTML代码（包括<table>标签），然后包装成一个完整的HTML文档，设置charset为urf-8以防止中文乱码
      var html =
        "<html><head><meta charset='utf-8' /></head><body>" +
        document.getElementById("s2").outerHTML +
        "</body></html>";
      // 实例化一个Blob对象，其构造函数的第一个参数是包含文件内容的数组，第二个参数是包含文件类型属性的对象
      var blob = new Blob([html], { type: "application/vnd.ms-excel" });
      var a = document.getElementById("dd");
      // 利用URL.createObjectURL()方法为a元素生成blob URL
      a.href = URL.createObjectURL(blob);
      // 设置文件名
      a.download = "值班表.xls";
    },
    async greet(a) {
      $("#s1")[0].innerHTML = "";
      this.show(a);
      var term = document.getElementById("term").value;
      var place = document.getElementById("place").value;
      var stuWeek = document.getElementById("stuWeek").value;
      var weeks = a; // document.getElementById("index").value;
      console.log(term);
      console.log(place);
      console.log(stuWeek);
      console.log(weeks);
      const res = await Api.testRota({
        term: term,
        place: place,
        stuWeek: stuWeek,
        weeks: weeks,
      });
      const item = res.rota;
      this.items = item;
      console.log("数据：", item);
 
    },
  },
};
</script>
 
<style scoped>
.bt {
  background-color: #87cefa;
  font-size: 15px;
  color: white;
  margin: 10px;
  margin-left: 20px;
}
.bt:hover {
  background-color: rgba(20, 25, 255, 0.3);
  font-weight: bolder;
}
.selectmsg select {
  height: 25px;
}
.selectmsg label {
  font-size: 15px;
  font-weight: 800;
}
.check {
  font-size: 13px;
  color: white;
  border: #ffffff solid 2px;
  border-radius: 15px;
  background-color: #87cefa;
  padding: 7px;
}
</style> 


<style src="@/asset/jsp/layui/css/layui.css"  scoped></style>
