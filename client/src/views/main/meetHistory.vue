<template>
 <!-- style="margin-left: 40px; margin-right: 40px" -->
  <div>
    <el-table
    border
      style="height: 848px; width: 100%"
      :data="
        meetInfoHistory.filter(
          (data) =>
            !search ||
            data.sessionName.toLowerCase().includes(search.toLowerCase())
        )
      "
    >
      <el-table-column align="center"  label="会议名称" prop="sessionName"> </el-table-column>
      
      <el-table-column align="center" label="创建时间" prop="createdTime"> </el-table-column>
      <el-table-column align="center" label="结束时间" prop="overTime"> </el-table-column>
      <el-table-column align="center" label="参与人数" prop="count"> </el-table-column>
      <el-table-column align="center" label="会议状态" prop="overStatus"
        ><template slot-scope="scope">
          <div slot="reference" class="name-wrapper">
            <el-tag  :type="scope.row.overStatus?'success':'info'" size="medium">{{ scope.row.overStatus?"结束":"进行" }}</el-tag>
          </div>
 
        </template></el-table-column
      >
      <el-table-column align="center">
        <template slot="header" slot-scope="scope">
          <el-input v-model="search" size="mini" placeholder="输入关键字搜索" />
        </template>
        <template slot-scope="scope">
          <el-button size="mini" @click="handleEdit(scope.$index, scope.row)"
            >进入</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <div class="block" style="text-align: center; margin-top: 23px">
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-size="15"
        layout="total, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </div>
  </div>
</template>

<script>
import api from "@/api/openvidu/openvidu"
export default {
  ROUTER_NAME: "meet",
  ROUTER_TITLE: "会议记录",
  ROUTER_ICON: "el-icon-s-help",
  name: "history",
  data() {
    return {
      total: 0,
      search: "",
      meetInfoHistory: [],
      currentPage: 0,
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    // deleteMeet
    async handleDelete(index, value){
      const result = await api.deleteMeet({meetId:value.meetId})
      console.log("删除状态",result)
      this.$message.success("删除成功")
      this.getData()
    },
    handleEdit(index, value) {
      console.log(index, value)
      this.$router.push({
        name: "echars",
        query: { sessionName: value.sessionName, sessionId: value.sessionId },
      })
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`)
    },
    handleCurrentChange(val) {
      console.log(`第 ${val} 页`)
      this.getData(val)
    },
    async getData(current) {
      const result = await api.getHistory({ current: current })
      const meetInfoHistory = result?.data?.meetInfoHistory
      this.total = result?.data?.total || 0
      if (meetInfoHistory?.length) {
        meetInfoHistory.forEach((value) => {
          console.log(value)
        })
      }
      // meetInfoHistor
      this.meetInfoHistory = meetInfoHistory

      console.log("history", result, meetInfoHistory)
    },
    getHistory() {
      api.getHistory().then((res) => {
        console.log(res)
      })
    },
  },
}
</script>

<style>
</style>