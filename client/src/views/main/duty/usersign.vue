<template>
  <div class="selectbody">
    <!--折叠插件显示用户所有信息-->
    <div class="hearderFont">
      <span>参加的会议信息</span>
    </div>
    <!-- <el-divider></el-divider> -->
    <div class="tablearound">
      <el-table :data="users" style="width: 100%">
        <el-table-column prop="userid" label="序号" width="180"> </el-table-column>
        <el-table-column prop="username" label="用户名" width="180">
        </el-table-column>
        <el-table-column prop="signdate" label="签到时间"> </el-table-column>
        <el-table-column prop="signlocation" label="定位信息">
        </el-table-column>
      </el-table>
    </div>
    <el-row class="bottombuttons" style="text-align: center">
      <el-button type="primary" @click="searchdialogTableVisible = true"
        >查询用户</el-button
      >
      <el-button type="success" @click="signdialogTableVisible = true"
        >点击签到</el-button
      >
      <el-divider style="margin: 10px" direction="vertical"></el-divider>
      <el-popover placement="right" width="100" trigger="click"> 
        <el-button slot="reference" type="primary" icon="el-icon-menu"
          >二维码</el-button
        >
      </el-popover>
    </el-row>
    <!-- 查询用户模态框（Modal） -->
    <el-dialog title="查询功能" :visible.sync="searchdialogTableVisible">
      <el-form :model="form">
        <el-form-item label="用户名" label-width="120px">
          <el-input v-model="form.username" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <el-table
        height="400"
        max-height="400"
        empty-text="无人签到"
        :data="queryusers"
      >
        <el-table-column
          property="userid"
          label="序号"
          width="150"
        ></el-table-column>
        <el-table-column
          property="username"
          label="用户名"
          width="200"
        ></el-table-column>
        <el-table-column property="signdate" label="签到时间"></el-table-column>
        <el-table-column
          property="signlocation"
          label="定位信息"
        ></el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="searchdialogTableVisible = false">关 闭</el-button>
        <el-button type="primary" @click="queryUserInfo">查 询</el-button>
      </div>
    </el-dialog>

    <!-- 签到时的模态框（Modal） -->
    <el-dialog title="签到功能" :visible.sync="signdialogTableVisible">
      <el-form :model="signform">
        <el-form-item label="用户名" label-width="120px">
          <el-input
            disabled
            v-model="signform.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="签到时间" label-width="120px">
          <el-input
            disabled
            v-model="signform.signdate"
            autocomplete="off"
          ></el-input>
          <el-button @click="getDate">获取时间</el-button>
        </el-form-item>
        <el-form-item label="签到位置" label-width="120px">
          <el-input
            disabled
            v-model="signform.signlocation"
            autocomplete="off"
          ></el-input>
          <el-button @click="showAddress">获取定位</el-button>
          （需手机精准定位）
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="signdialogTableVisible = false">关 闭</el-button>
        <el-button type="primary" @click="show">签 到</el-button>
      </div>
    </el-dialog>

    <el-dialog
    v-if="mapDialogVisible" 
  title="定位"
  :visible.sync="mapDialogVisible"
  width="30%"
  center>
   <div style="height:200px;">
     <e-map>
      </e-map>
   </div>
  <span slot="footer" class="dialog-footer"> 
    <el-button type="primary" @click="mapDialogVisible = false;getLocation()">关 闭</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>

import eMap from "@/components/amap"
import Api from "@/api/message/message"
export default {
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "会议记录表",
  ROUTER_NAME: "message", 
  ROUTER_HIDDEN:false,
  components:{
    "e-map":eMap
  },
  data: function () {
    return {
      mapDialogVisible:false,
      queryusers: [],
      users: [],
      showModel: false,
      form: {
        username: "",
      },
      signform: {
        username: "",
        signdate: "",
        signlocation: "",
      },
      searchdialogTableVisible: false,
      signdialogTableVisible: false,
    }
  },
  methods: {
    async show() {
      var n = this.signform.username
      var d = this.signform.signdate
      var l = this.signform.signlocation
      await Api.addUserInfo(this.signform)

      if (n != "" && d != null && l != "") {
        alert("签到成功！正在返回...")
        // location.reload()
        this.signdialogTableVisible = false
        this.showAllUserInfo()
      } else {
        alert("数据不完善，请重试！")
      }
    },
    /**
     * 获取
     */
    showAddress() {
      this.mapDialogVisible = true
      // window.open("http://localhost:8080/LocateUserInfo")
    },
    getDate() {
      var mydate = new Date()
      var year = mydate.getFullYear()
      var month = mydate.getMonth() + 1
      var day = mydate.getDate()
      var hours = mydate.getHours()
      var min = mydate.getMinutes()
      var s = mydate.getSeconds()
      var dateString =
        year + "年" + month + "月" + day + "日" + hours + ":" + min + ":" + s
      this.signform.signdate = dateString
    },
    getLocation(){
      const s = localStorage.getItem("locate")
      this.signform.signlocation = s
      localStorage.removeItem("locate")
    },
    updateUserName(){ 
      console.log("username",this.$store.getters.name)
      this.signform.username = this.$store.getters.name
    },
    async queryUserInfo() {
      var username = this.form.username
      if (username == "") {
        alert("输入的用户名为空！请重试！")
      }
      //ajax请求返回查询结果数据
      const res = await Api.OneSignUsers({ username })
      this.queryusers = res.users
      console.log(this.queryusers)
    },
    async showAllUserInfo() {
      //ajax请求返回查询结果数据
      const res = await Api.showAllSignUser()
      this.users = res.users
      console.log(this.users)
    },
  },
  created: function () {
    /*
    * created页面加载未渲染html之前执行。
        mounted渲染html后再执行。
    * */
    this.showAllUserInfo()
    this.updateUserName()
  },
  mounted() {
    // $("#collapseTwo").collapse("show")
  },
}
</script> 

<style >
#index {
  width: 90%;
  padding-left: 15%;
}

#collapseTwo {
  background-color: darkseagreen;
}
#signdate {
  border: 0;
}
#signlocation {
  border: 0;
}
.tablearound {
  margin: 20px;
}
.hearderFont {
  font-size: 2em;
  background-color: white;
  text-align: center;
  vertical-align: middle;
}

div >>> .el-popover {
  text-align: center;
}
.el-table__empty-block {
  height: inherit;
}
.bottombuttons {
  margin: 20px;
}
.selectbody {
  /* bug? */
  /* / height: 100%; */
  background-color: white;
}


</style>
 