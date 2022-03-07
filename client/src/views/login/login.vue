<template>
  <div id="login">
    <div class="content">
      <div class="form sign-in">
        <h2>欢迎回来</h2>
        <form autocomplete="off">
          <label>
            <span>学工号</span>
            <input v-model="user.userId" type="text" required />
          </label>
          <label>
            <span>密码</span>
            <input v-model="user.password" type="password" required />
          </label>
          <br />
          <input class="i1" type="button" @click="login" value="登录" />
        </form>
      </div>
      <div class="sub-cont">
        <div class="img">
          <div class="img__text m--up">
            <h2>还未注册？</h2>
            <p>立即注册</p>
          </div>
          <div class="img__text m--in">
            <h2>已有帐号？</h2>
            <p>有帐号就登录吧，好久不见了！</p>
          </div>
          <div class="img__btn" @click="changeLable">
            <span class="m--up">注 册</span>
            <span class="m--in">登 录</span>
          </div>
        </div>
        <div class="form sign-up">
          <h2>注册</h2>
          <form autocomplete="off">
            <label>
              <span>学工号</span>
              <input v-model="user.userId" name="aNum" type="text" required />
            </label>
            <label>
              <span>姓名</span>
              <input v-model="user.userName" type="text" required />
            </label>
            <label>
              <span>密码</span>
              <input
                v-model="user.password"
                name="aPassWord"
                type="password"
                required
              />
            </label>
            <label>
              <span>专业/职称</span>
              <input v-model="user.aclass" name="aclass" type="text" />
            </label>
            <label>
              <span>邮箱</span>
              <input v-model="user.email" name="email" type="text" />
            </label>
            <label>
              <span>联系电话</span>
              <input
                name="atel"
                type="tel"
                v-model="user.atel"
                id="telphone"
                @blur="checkTel"
                required
              />
            </label>
            
            <label>
              <span>所属学院</span>
              <select v-model="user.afaculty" name="afaculty">
                <option value="计算机学院">计算机学院</option>
                <option value="信息学院">信息学院</option>
                <option value="工业自动化学院">工业自动化学院</option>
                <option value="材料与环境学院">材料与环境学院</option>
                <option value="航空学院">航空学院</option>
                <option value="数理与土木工程学院">数理与土木工程学院</option>
                <option value="商学院">商学院</option>
                <option value="经济与金融学院">经济与金融学院</option>
                <option value="外国语学院">外国语学院</option>
                <option value="民商法律学院">民商法律学院</option>
                <option value="设计与艺术学院">设计与艺术学院</option>
                <option value="布莱恩特学院">布莱恩特学院</option>
                <option value="中美国际学院">中美国际学院</option>
                <option value="马克思主义学院">马克思主义学院</option>
              </select>
            </label>
            <br />
            <div id="msg"  style="color: red">{{msg}}</div>
            <br />
            <input :disabled="disabled" id="btnSubmit" @click="register" class="i1" value="注册" />
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
<script> 
import CommonPage from "@/lib/utils/mixin/CommonPage"
import Api from "@/api/user_info"
export default {
  data() {
    return {
      
      msg:"",
      disabled:true,
      user: {
        userId: "13430050201",
        userName:"",
        password: 12345678,
        aclass: "",
        atel: "",
        email:"",
        afaculty: "",
      },
    }
  },
  created() {},
  methods: {
    async register() {
      console.log("注册：", this.user)
      await Api.register(this.user)

      this.$message({
        message: "恭喜你，注册成功！",
        type: "success",
      })
      this.changeLable()
    },
    async login() {
      const res = await Api.login(this.user)
      console.log("拿到token", res)
      this.$message({
        message: "恭喜你，登录成功！",
        type: "success",
      })

      this.goPage("kb")
    },
    checkTel() {
      var mytel = this.user.atel
      var isPhone = /^1[3-9][\d]{9}$/
      var value = mytel.trim()
      console.log("检查电话",value)
      // isMob.test(value) ||
      if ( isPhone.test(value)) {
        this.msg = ""
        this.disabled = false //可以点击按钮提交
      } else {
        this.msg = "电话号码格式不对，请重输"
        this.disabled = true //不可以点击按钮提交信息
      }
    },
    changeLable() {
      document.querySelector(".content").classList.toggle("s--signup")
    },
  },
  ROUTER_NAME: "login",
  extends: CommonPage,
}
</script> 
