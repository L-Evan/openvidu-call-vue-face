


<template>
  <div>
    <div style="padding: 15px">
      <fieldset class="layui-elem-field">
        <legend>用户管理 - 用户列表</legend>
        <div class="layui-field-box">
          <!-- action="${pageContext.request.contextPath}/findAll" -->

          <form class="layui-form" action="#" autocomplete="off">
            <div class="layui-inline" style="text-align: left">
              <div class="layui-input-inline">
                <input
                  id="select"
                  type="button"
                  class="layui-btn"
                  value="刷新"
                  @click="getAllUser"
                />
              </div>
            </div>
          </form>
          <hr />
          <table id="tab1" class="layui-table">
            <thead>
              <tr>
                <th style="text-align: center">用户ID</th>
                <th style="text-align: center">学工号</th>
                <th style="text-align: center">用户名</th>
                <th style="text-align: center">角色名</th>
                <th style="text-align: center">操作</th>
              </tr>
            </thead>
            <tbody id="userlist">
              <tr v-for="(u, index) in users" :key="index" class="adminUser">
                <td align="center" name="aID" id="aID">{{ u.id }}</td>
                <td align="center">{{ u.userId }}</td>
                <td align="center">{{ u.userName }}</td>
                <td align="center">{{ u.roleRemarks }}</td>
                <td class="text-center">
                  <div class="layui-btn-group">
                    <button
                      class="layui-btn layui-btn-xs layui-btn-normal dw-dailog"
                      @click="initForm(index, users),dialogFormVisible=true"
                      dw-title="编辑用户"
                    >
                      <i class="layui-icon"></i>编辑
                    </button>
                    <button
                      class="layui-btn layui-btn-xs layui-btn-danger dw-delete"
                      @click="deleteUser(u.userId)"
                    >
                      <i class="layui-icon"></i>删除
                    </button>
                  </div>
                </td>
              </tr>
              <input
                type="text"
                name="selection"
                style="display: none"
                id="selection"
              />
            </tbody>
          </table>
        </div>
      </fieldset> 
      <el-dialog title="用户信息" :visible.sync="dialogFormVisible">
        <el-form :model="updateData">
          <el-form-item disabled label="ID" :label-width="formLabelWidth">
            <el-input v-model="updateData.userId" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="姓名" :label-width="formLabelWidth">
            <el-input v-model="updateData.userName" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="角色" :label-width="formLabelWidth">
            
            <el-select :disabled="$store.getters.roles[0]!='admin'" v-model="updateData.roleId" placeholder="请选择角色"> 
              <el-option  v-for="(item,index) in roles" :key="index"  :label="item.roleRemarks" :value="item.roleId"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="changeUser(),dialogFormVisible = false"
            >确 定</el-button
          >
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import CommonPage from "@/lib/utils/mixin/CommonPage"
import Api from "@/api/user.js"
export default {
  ROUTER_ROLES: ["admin"],
  ROUTER_NAME: "users",
  ROUTER_TITLE: "用户处理",
  ROUTER_ICON: "el-icon-s-help",
  data() {
    
    return {
      formLabelWidth:"120px",
      dialogFormVisible:false,
      roles:[{
        
      }],
      users: [],
      updateData: {
        userId: "",
        userName: "",
        avatar: "",
        roleId:"",
        roleRemarks:""
      }
    }
  },
  methods: {
    deleteUser(userId) {
      this.$confirm("此操作将删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          await Api.deleteUser({ userId })
          this.$message({
            type: "success",
            message: "删除成功!",
          })
          this.getAllUser()
        })
        .catch(() => {
          // this.$message({
          //   type: "info",
          //   message: "已取消删除",
          // })
        })
    },
    initForm(index, users){
      ({...this.updateData} = users[index])
      console.log("更新的表单，",this.updateData) 
      this.getAllUserRole()
    },
    async getAllUserRole(){
      const res =   await Api.getAllUserRole()
      const roles = res.roles
      this.roles = roles
    },
    
    async changeUser() { 
      await Api.updateUser(this.updateData)
      this.getAllUser()
    },
    async getAllUser() {
      const res = await Api.getAllUser()
      console.log("用户列表", res)
      this.users = res.users
      this.$message({
        message: "刷新数据成功！",
        type: "success",
      })
    },
  },
  mounted() {
    this.getAllUser()
  },
  extends: CommonPage,
}
</script> 
<style scoped> 
</style>
