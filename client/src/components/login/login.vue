<template>
  <div class="page">
    <div class="container">
      <div class="left">
        <div class="login">视频会议</div>
        <div class="eula">欢迎使用情绪分析会议系统！</div>
      </div>
      <div class="right">
        <lt-tag
          v-on:click="animecomplemt(0)"
          :style="{ display: displaytag ? 'block' : 'none' }"
          name="返回"
        >
        </lt-tag>
         <!-- svg -->
        <slot v-if="logintype == 0"></slot>
        <form v-on:submit.prevent="submitForm" class="form" ref="form">
          <!-- 0 登录 1 注册 2忘密 -->
          <div v-if="logintype == 0">
            <label>账号</label>
            <input type="text"
              v-model="itemslogin.userId"
              @focus="focusSubmit(0, '240 1386')"
            />
            <label>密码</label>
            <input
              class="errbroder"
              ref="registerp"
              v-model="itemslogin.password"
              type="password"
              @focus="focusSubmit(-336, '240 1386')"
            />
            <div @click="showpassword($event, 'registerp')" class="icondiv">
              <i class="iconfont icon-eye" title="显示密码"></i> 
            </div>
          </div>
          <!-- 注册 -->
          <div class="register" v-if="logintype == 1">
            <label>邮箱</label>
            <input v-model="itemsregister.email" type="email" />
            <label>账号</label>
            <input v-model="itemsregister.userId" />
            <label>密码</label>
            <input
              :class="{ errbroder: errtrue }"
              v-model="itemsregister.password"
              type="password"
            />
            <!-- <label  >验证码</label>
                        <input v-model="itemsregister.yzm" type="yzm"> -->
          </div>
          <!-- 忘记 -->
          <div v-if="logintype == 2" class="{isTrue: test}">
            <label>邮箱号</label>
            <input v-model="itemschange.userId" />
            <label>验证码</label>
            <input v-model="itemschange.code" type="password" />
            <label>新密码</label>
            <input v-model="itemschange.password" type="password" />
          </div>

          <div style="position: relative; height: 0px">
            <div
              v-if="errtrue"
              :style="{ color: 'red' }"
              style="top: 20px; font-size: 10px; position: absolute"
            >
              {{ messige }}
            </div>
          </div>
          <input
            class="submit"
            type="submit"
            ref="submit"
            id="submit"
            @focus="focusSubmit(-730, '530 1386')"
            value="提交"
          />
          <input type="hidden" name="type" :value="logintype" />
          <div v-if="logintype == 0" class="login-bottom-div">
            <a href="#" @click="changeloginstatic(1)" class="text-info"
              >注册用户</a
            >
            <a href="#" @click="changeloginstatic(2)" class="text-info"
              >忘记密码</a
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import ltTag from "@/components/login/ltTag"
import anime from "animejs"
export default {
  components: { ltTag },
  name: "login",
  data() {
    return {
      errtrue: false,
      messige: "密码错误",
      displaytag: false,
      logintype: 0,
      itemslogin: {
        userId: 13430050201, // 暂时放默认值
        password: 12345678,
      },
      itemsregister: {
        email: undefined,
        userId: undefined,
        password: undefined
      },
      itemschange: {
        username: undefined,
        code: undefined,
        password: undefined,
      },
      status: 0,
      current: null
    }
  },
  methods: {
    showpassword(dom, p) {},
    /*向外传递请求
     */
    login: function () {
      console.log(this.logintype)
      switch (this.logintype) {
      case 0:
        console.log("登录")
        this.$emit("login", this.itemslogin)
        break
      case 1:
        this.$emit("register", this.itemsregister)
        break
      case 2:
        this.$emit("change", this.itemschange)
        break
      }
    },
    // 提交登录
    submitForm: function () {
      this.login()
    },
    /*svg动画*/
    focusSubmit(valueoff, valueharr) {
      console.log(this.current)
      if (this.current) this.current.pause()
      this.current = anime({
        targets: "path",
        strokeDashoffset: {
          value: valueoff, //-730,
          duration: 700,
          easing: "easeOutQuart",
        },
        strokeDasharray: {
          value: valueharr, //'530 1386',
          duration: 700,
          easing: "easeOutQuart",
        },
      })
      console.log("path: "+this.current)
    },
    /*返回动画*/
    changeloginstatic(type) {
      if(type===2){
        this.$message({
          message: "请联系系统管理员修改密码",
          type: "warning"
        })
        return
      }
      //动画和调整
      this.animecomplemt(type)
    },
    /**盒子开闭
     */
    animecomplemt(staticv) {
      this.logintype = staticv
      anime({
        targets: ".left",
        left: staticv ? 160 : 0,
        loop: false,
        easing: "linear",
        duration: 500,
      })
      anime({
        targets: ".right",
        right: staticv ? 160 : 0,
        loop: false,
        easing: "linear",
        duration: 500,
      })
      this.$refs.form.style["margin-top"] = staticv ? "20px" : "26px"
      this.$refs.submit.style["margin-top"] = staticv ? "20px" : "40px"

      setTimeout(() => {
        console.log(this.$refs.tag)
        this.displaytag = !this.displaytag
        this.logintype = staticv
      }, 500)
    },
  },
  mounted() {},
}
</script>

<style scoped> 

.icondiv .icon {
  position: relative;
  right: 0px;
  top: -23px;
}
.icondiv {
  text-align: end;
  width: 100%;
  height: 0px;
}
/* feTurbulence   */
/* .errbroder{  
    border: 0px solid rgba(250, 61, 61, 1);  
    animation  :errorm 4s
} */

@keyframes errorm {
  form {
    border: 1px solid rgba(250, 61, 61, 1);
  }

  to {
    border: 1px solid rgba(250, 61, 61, 0);
  }
}

form input {
  width: 241px;
}

.margin-sm {
  margin: 10px;
}




.login-bottom-div {
  margin: 0 auto;
  width: 100%;
  font-size: 10px;
  text-align: center;
  margin-top: 30px;
}
.login-bottom-div a {
  /* margin-right:30px;
    margin-left:30px; */
  margin: 30px;
}

/* .login-img{
    margin: 12px;
    width: 30px;
    height: 30px;
} 
.login-main .login-btn{ 
    opacity: 0;
    width:0px;
    height:0px; 
}
.login-main:hover .login-img {
    display: none;
}
.login-main:hover .login-btn { 
    opacity: 1;
    width:auto;
    height:auto; 
    transition: .10s; 
} */

/*更多 http://www.bootstrapmb.com*/

/* @charset "utf-8"; */

::selection {
  background: #2d2f36;
}

::-webkit-selection {
  background: #2d2f36;
}

::-moz-selection {
  background: #2d2f36;
}

body {
  background: white;
  font-family: "Inter UI", sans-serif;
}

.page {
  background: #e2e2e5;
  display: flex;
  flex-direction: column;
  height: calc(100%);
  position: absolute;
  place-content: center;
  width: calc(100%);
}

@media (max-width: 767px) {
  .page {
    height: auto;
    margin-bottom: 20px;
    padding-bottom: 20px;
  }
}

.container {
  display: flex;
  height: 320px;
  margin: 0 auto;
  width: 640px;
  padding: 0px;
}

@media (max-width: 767px) {
  .container {
    flex-direction: column;
    height: 630px;
    width: 320px;
  }
}

/* zuoyou */

@keyframes leftAnimation {
  from {
    left: 160px;
  }
  30% {
    left: 160px;
  }
  to {
    left: 0px;
  }
}

@keyframes rightAnimation {
  from {
    right: 160px;
  }
  30% {
    right: 160px;
  }
  to {
    right: 0px;
  }
}

/* 0-320 */

.left {
  background: white;
  height: calc(100% - 40px);
  top: 20px;
  position: relative;
  width: 50%;
  animation: leftAnimation 2s;
}

@media (max-width: 767px) {
  .left {
    height: 100%;
    left: 20px;
    width: calc(100% - 40px);
    max-height: 270px;
  }
}

.login {
  font-size: 50px;
  font-weight: 900;
  margin: 50px 40px 40px;
}

.eula {
  color: #999;
  font-size: 14px;
  line-height: 1.5;
  margin: 40px;
}

.right {
  background: #474a59;
  box-shadow: 0px 0px 40px 16px rgba(0, 0, 0, 0.22);
  color: #f1f1f2;
  position: relative;
  width: 50%;
  animation: rightAnimation 2s;
}

@media (max-width: 767px) {
  .right {
    flex-shrink: 0;
    height: 100%;
    width: 100%;
    max-height: 350px;
  }
}



.form {
  margin: 40px;
  margin-top: 26px;
  position: absolute;
}

form label {
  color: #c2c2c5;
  display: block;
  font-size: 14px;
  height: 16px;
  margin-top: 20px;
  margin-bottom: 5px;
}

form input {
  background: transparent;
  border: 0;
  color: #f2f2f2;
  font-size: 20px;
  height: 30px;
  line-height: 30px;
  outline: none !important;
  width: 100%;
  border-bottom: paleturquoise;
}
/**下划线
*/
.register input:focus {
  padding-bottom: 10px;
  animation: focusAnimation 1s;
  border-bottom: 1px solid rgba(255, 255, 255, 255);
}
.change input:focus {
  padding-bottom: 10px;
  animation: focusAnimation 1s;
  border-bottom: 1px solid rgba(255, 255, 255, 255);
}
@keyframes focusAnimation {
  from {
    border-bottom: 0px solid rgba(255, 255, 255, 0);
  }
  to {
    border-bottom: 1px solid rgba(255, 255, 255, 255);
  }
}

input::-moz-focus-inner {
  border: 0;
}

#submit {
  color: #707075;
  margin-top: 40px;
  transition: color 300ms;
}

#submit:focus {
  color: #f2f2f2;
}

#submit:active {
  color: #d0d0d2;
}
</style>