


<template>
  <div style="padding: 24px;">
    <el-button style="margin-top: -10px;margin-bottom: 10px;" @click="getAllUser" >刷新</el-button>

    <el-table :data="
        users.filter(
          (data) =>
            !search ||
            data.userId.toLowerCase().includes(search.toLowerCase())
        )
      "  border>
      <el-table-column align="center" label="用户ID	" prop="id">
      </el-table-column>
      <el-table-column align="center" label="用户账号" prop="userId">
      </el-table-column>
      <el-table-column align="center" label="用户名" prop="userName">
      </el-table-column>
      <el-table-column align="center" label="用户邮箱" prop="email">
      </el-table-column>
      <el-table-column align="center" label="角色名" prop="roleRemarks">
      </el-table-column>
      <el-table-column align="center">
        <template slot="header" slot-scope="scope">
          <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
        </template>
        <template slot-scope="scope">
          <el-button
            size="mini"
            @click="
              initForm(scope.$index, scope.row), (dialogFormVisible = true)
            "
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="deleteUser(scope.row.userId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div style="padding: 15px">
      <el-dialog title="用户信息" :visible.sync="dialogFormVisible">
        <el-form :model="updateData">
          <el-form-item disabled label="ID" :label-width="formLabelWidth">
            <el-input disabled v-model="updateData.userId" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="姓名" :label-width="formLabelWidth">
            <el-input
              v-model="updateData.userName"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item label="角色" :label-width="formLabelWidth">
            <el-select
              :disabled="$store.getters.roles[0] != 'admin'"
              v-model="updateData.roleId"
              placeholder="请选择角色"
            >
              <el-option
                v-for="(item, index) in roles"
                :key="index"
                :label="item.roleRemarks"
                :value="item.roleId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button
            type="primary"
            @click="changeUser(), (dialogFormVisible = false)"
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
      search: "",
      formLabelWidth: "120px",
      dialogFormVisible: false,
      roles: [{}],
      users: [],
      updateData: {
        userId: "",
        userName: "",
        avatar: "",
        roleId: "",
        roleRemarks: "",
      },
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
    initForm(index, user) {
      this.updateData = user
      console.log("更新的表单，", this.updateData)
      this.getAllUserRole()
    },
    async getAllUserRole() {
      const res = await Api.getAllUserRole()
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
