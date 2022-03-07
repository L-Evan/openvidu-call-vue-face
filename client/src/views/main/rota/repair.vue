<template>
  <div>
    <div id="app">
      <form id="contant-form" class="form" name="contact-form">
        <h1 class="form__headline">维修表格</h1>
        <div class="form__description">
          <p>请输入必要事项后，进入确认画面。</p>
          <p>
            <span class="form__required-label">必须</span
            >这个项目麻烦您务必输入。
          </p>
        </div>
        <fieldset class="form__group">
          <legend class="form__group-header">
            <span class="form__group-label">您的姓名</span>
            <strong class="form__required-label">必须</strong>
          </legend>
          <div class="form__group-content">
            <div class="form__name">
              <div class="form__text-input">
                <label class="visually-hidden" for="name">姓名</label>
                <p class="text-input">
                  <input
                    id="name"
                    class="text-input__body"
                    type="text"
                    name="rname"
                    autocomplete="family-name"
                    placeholder="姓名"
                    required
                  />
                  <span class="text-input__validator"></span>
                </p>
              </div>
            </div>
            <p
              class="form__validation"
              data-validation="family-name"
              role="alert"
              aria-live="assertive"
            ></p>
          </div>
        </fieldset>

        <div class="form__group">
          <p class="form__group-header">
            <label class="form__group-label" for="tel">电话号码</label>
          </p>
          <div class="form__group-content">
            <div class="form__text-input">
              <p class="text-input">
                <input
                  id="tel"
                  class="text-input__body -placeholder-visible"
                  type="tel"
                  name="tel"
                  placeholder="请填写正确的联系方式"
                  autocomplete="tel"
                  title="请正确填写电话号码"
                />
                <span class="text-input__validator"></span>
              </p>
            </div>
            <p
              class="form__validation"
              data-validation="tel"
              role="alert"
              aria-live="assertive"
            ></p>
          </div>
        </div>

        <div class="form__group">
          <p class="form__group-header">
            <label class="form__group-label" for="address">教学楼</label>
            <strong class="form__required-label">必须</strong>
          </p>
          <div class="form__group-content">
            <div class="form__select-box">
              <div class="select-box">
                <select
                  id="address"
                  class="select-box__body"
                  name="place"
                  title="请务必选择指定教学楼"
                  required
                >
                  <option value="" disabled selected hidden>选择教学楼</option>
                  <option value="明德楼">明德楼</option>
                  <option value="知行楼">知行楼</option>
                </select>
              </div>
            </div>
            <p
              class="form__validation"
              data-validation="address-level1"
              role="alert"
              aria-live="assertive"
            ></p>
          </div>
        </div>

        <div class="form__group">
          <p class="form__group-header">
            <label class="form__group-label" for="classroom">维修教室</label>
            <strong class="form__required-label">必须</strong>
          </p>
          <div class="form__group-content">
            <div class="form__text-input -wide">
              <p class="text-input">
                <input
                  id="classroom"
                  class="text-input__body"
                  type="text"
                  name="rClassroom"
                  placeholder="如有多间教室请用,隔开"
                  autocomplete="address-level2"
                  title="必须输入教室"
                  required
                />
                <span class="text-input__validator"></span>
              </p>
            </div>
            <p
              class="form__validation"
              data-validation="address-level2"
              role="alert"
              aria-live="assertive"
            ></p>
          </div>
        </div>

        <fieldset class="form__group">
          <legend class="form__group-header">
            <span class="form__group-label">维修内容</span>
          </legend>
          <div class="form__group-content">
            <ul class="form__group-list">
              <li class="form__group-list-item">
                <label class="checkbox">
                  <input
                    class="checkbox__input"
                    type="checkbox"
                    name="survey"
                    value="教师机"
                  />
                  <span class="checkbox__icon"></span>
                  <span class="checkbox__text">教师机</span>
                </label>
              </li>
              <li class="form__group-list-item">
                <label class="checkbox">
                  <input
                    class="checkbox__input"
                    type="checkbox"
                    name="survey"
                    value="学生机"
                  />
                  <span class="checkbox__icon"></span>
                  <span class="checkbox__text">学生机</span>
                </label>
              </li>
              <li class="form__group-list-item">
                <label class="checkbox">
                  <input
                    class="checkbox__input"
                    type="checkbox"
                    name="survey"
                    value="空调"
                  />
                  <span class="checkbox__icon"></span>
                  <span class="checkbox__text">空调</span>
                </label>
              </li>
              <li class="form__group-list-item">
                <label class="checkbox">
                  <input
                    class="checkbox__input"
                    type="checkbox"
                    name="survey"
                    value="电灯"
                  />
                  <span class="checkbox__icon"></span>
                  <span class="checkbox__text">电灯</span>
                </label>
              </li>
            </ul>

            <input name="rContext" style="display: none" value="" id="index" />
          </div>
        </fieldset>
        <div class="form__group">
          <p class="form__group-header">
            <label class="form__group-label" for="datetime">维修时间</label>
          </p>
          <div class="form__group-content">
            <div class="form__text-input">
              <p class="text-input">
                <input
                  id="datetime"
                  class="text-input__body"
                  type="date"
                  name=""
                  title="请选择时间"
                />
                <span class="text-input__validator"></span>
              </p>
            </div>
            <p
              class="form__validation"
              data-validation="datetime"
              role="alert"
              aria-live="assertive"
            ></p>
          </div>
          <input name="rTime" style="display: none" value="" id="index2" />
        </div>

        <div class="form__group">
          <p class="form__group-header">
            <label class="form__group-label" for="message">维修情况</label>
            <strong class="form__required-label">必须</strong>
          </p>
          <div class="form__group-content">
            <div class="form__textarea">
              <div class="textarea js-flexible-textarea">
                <textarea
                  id="message"
                  class="textarea__body"
                  name="rSolution"
                  placeholder="请填写维修前后情况,如:教室主机无法开机,重新配置后正常开机.若有其它维修情况也请如实填写."
                  title="请填写维修情况"
                  required
                ></textarea>
              </div>
            </div>
            <p
              class="form__validation"
              data-validation="message"
              role="alert"
              aria-live="assertive"
            ></p>
          </div>
        </div>

        <div id="form__group-content" align="center" style="margin: 20px">
          <input
            type="button"
            value="提交"
            class="file-select__button"
            v-on:click="greet()"
          />
          <label class="file-select__button">返回</label>
        </div>
      </form>
    </div>
  </div>
</template>
<script src="@/asset/jsp/js/focus-visible.min.js"></script>
<script src="@/asset/jsp/js/moment.min.js"></script>
<script src="@/asset/jsp/js/ajaxzip3.js"></script>
<script src="@/asset/jsp/js/script.js"></script>

<script>

import CommonPage from "@/lib/utils/mixin/CommonPage"
import Api from "@/api/rota/rota.js"
// import Api from "@/api/kb"
export default { 
  mixins:[CommonPage],
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "维修表单记录",
  ROUTER_NAME: "test",
  data() {
    return { 
    };
  },
  created: function () {},
  mounted() {},
  methods: {
    async greet() {
      var flag = this.test();
      if (flag == true) {
        this.show();
        var rname = document.getElementById("name").value;
        var tel = document.getElementById("tel").value;
        var place = document.getElementById("address").value;
        var rClassroom = document.getElementById("classroom").value;
        var rContext = document.getElementById("index").value;
        var rTime = document.getElementById("index2").value;
        var rSolution = document.getElementById("message").value;
        console.log(rname);
        console.log(tel);
        console.log(place);
        console.log(rContext);
        console.log(rClassroom);
        console.log(rTime);
        console.log(rSolution);
        const data = {
          rname: rname,
          tel: tel,
          place: place,
          rContext: rContext,
          rClassroom: rClassroom,
          rTime: rTime,
          rSolution: rSolution,
        };
        //alert(rname+" "+tel+" "+place+" "+rClassroom+" "+rContext+" "+rTime+" "+rSolution);
        const res = await Api.testRepair(data);
        console.log(data);
        const status = res.status;
        if (status == 1) { 
          this.$router.push({name:"success",params:{
            name:"ouputrepair"
          }})
          //window.location.href = "success";
        }
      }
    },

    test() {
      var num = document.getElementById("tel").value;
      //alert(num);
      if (num.length < 11) {
        alert("请输入11位手机号码！");
        return false;
      }
      if (!/(^[1-9]\d*$)/.test(num)) {
        alert("请输入正确的手机号码");
        return false;
      }
      return true;
    },
    show() {
      var arry = document.getElementsByName("survey");
      var a = "";
      var d =   $("#datetime")[0];
      for (let i in arry) {
        if (arry[i].checked) {
          a += arry[i].value + ",";
        }
      }
      var rContext = $("#index")[0]  ;
      rContext.value = a;

      var rtime = $("#index2")[0];
      rtime.value = d.value;
    },
  },
};
</script>

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