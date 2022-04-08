<template>
  <div>
    <login
      ref="login"
      @login="login($event)"
      @register="register($event)"
      @change="changePassWrod($event)"
      style="vertical-align: middle; height: 100vh"
    >
      <!-- 解决svg无法双向绑定问题 -->
      <svg viewBox="0 14 320 300">
        <defs>
          <linearGradient
            inkscape:collect="always"
            id="linearGradient"
            x1="13"
            y1="193.49992"
            x2="307"
            y2="193.49992"
            gradientUnits="userSpaceOnUse"
          >
            <stop style="stop-color: #ff00ff" offset="0" id="stop876"></stop>
            <stop style="stop-color: #ff0000" offset="1" id="stop878"></stop>
          </linearGradient>
        </defs>
        <path
          ref="path"
          d="m 40,120.00016 239.99984,-3.2e-4 c 0,0 24.99263,0.79932 25.00016,35.00016 0.008,34.20084 -25.00016,35 -25.00016,35 h -239.99984 c 0,-0.0205 -25,4.01348 -25,38.5 0,34.48652 25,38.5 25,38.5 h 215 c 0,0 20,-0.99604 20,-25 0,-24.00396 -20,-25 -20,-25 h -190 c 0,0 -20,1.71033 -20,25 0,24.00396 20,25 20,25 h 168.57143"
          style="stroke-dashoffset: 0px; stroke-dasharray: 240, 1386"
        ></path>
      </svg>
    </login>
  </div>
</template>
<script>
import CommonPage from "@/lib/utils/mixin/CommonPage"
import login from "@/components/login/login"

import Api from "@/api/user_info"

export default {
  components: { login },
  data() {
    return {
      // 错误信息
      msg: "",
      disabled: true,
    }
  },
  created() {},
  methods: {
    async changePassWrod(V) {
      console.log("改密码", V)
    },
    async register(data) {
      console.log("注册：", this.user)
      await Api.register(data)
      this.$message({
        message: "恭喜你，注册成功！",
        type: "success",
      })
      this.changeLableTologin()
    },
    async login(data) {
      const res = await Api.login(data)
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
      console.log("检查电话", value)
      // isMob.test(value) ||
      if (isPhone.test(value)) {
        this.msg = ""
        this.disabled = false //可以点击按钮提交
      } else {
        this.msg = "电话号码格式不对，请重输"
        this.disabled = true //不可以点击按钮提交信息
      }
    },
    changeLableTologin() {
      // 返回登陆
      this.$refs["login"].animecomplemt(0)
    },
  },
  ROUTER_NAME: "login",
  extends: CommonPage,
}
</script> 

  <style>
svg {
  position: absolute;
  width: 320px;
}

path {
  fill: none;
  stroke: url(#linearGradient);
  stroke-width: 4;
  stroke-dasharray: 240 1386;
}
</style>