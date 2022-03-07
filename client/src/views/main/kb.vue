<template>
  <div id="main" class="app-container">
    <el-row :gutter="20" type="flex" class="row-bg">
      <el-col :span="4">
        <el-select v-model="select.term" filterable placeholder="请选择学年">
          <el-option
            v-for="(item, index) in terms"
            :key="index"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select v-model="select.place" @change="select.classRoom = ''" filterable placeholder="请选择教学楼">
          <el-option
            v-for="(item, index) in places"
            
            :key="index"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-select
          v-model="select.classRoom"
          filterable  
          placeholder="请选择教室"
        >
          <el-option
            v-for="(item, index) in selectClassRooms"
            :key="index"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="text" @click="dialogFormVisible = true"
          >添加课表
        </el-button>
      </el-col>
      <el-col :span="4">
        <el-button type="text" @click="uploadVisible = true"
          >上传文件
        </el-button>
      </el-col>
    </el-row>

    <table cellspacing="0" cellpadding="0" class="el-calendar-table">
      <thead>
        <th colspan="2">时间</th>
        <th v-for="(item, index) in dates" :key="index">{{ item }}</th>
      </thead>
      <tbody>
        <tr class="el-calendar-table__row">
          <!-- 第一列 -->
          <td rowspan="14" class="prev table-col-td">
            <div
              :style="{ height: tablecollen * tabletdheight }"
              class="table-col-td-div el-calendar-day"
            >
              <span
                v-for="(day, index) in daystr"
                :key="index"
                :style="{ 'height': day.rowspan * tabletdheight + 'px' }"
                class="td-div"
              >
                {{ day.name }}
              </span>
            </div>
          </td>
          <!-- 第二列 -->
          <td class="prev">
            <div
              :style="{ height: tabletdheight + 'px' }"
              v-for="item in 14"
              :key="item"
              class="el-calendar-day"
            >
              <span>第{{ item }}节</span>
            </div>
          </td>
          <!-- 课程 -->
          <td
            v-for="(val, colindex) in nowkbs"
            :key="colindex"
            rowspan="14"
            class="prev table-col-td class-farther"
          >
            <el-popover
              v-for="(room, index) in val"
              :key="index"
              placement="right"
              width="400"
              @show="handleClass(colindex, index)"
              trigger="click"
            >
              <el-card
                slot="reference"
                class="box-card class-item"
                :style="{
                  'height': room.len * tabletdheight + 'px',
                  top: (room.start - 1) * tabletdheight,
                  'background-color':
                    room.name == ''
                      ? white
                      : ColorList[(index + colindex) % ColorList.length].color,
                }"
              >
                <div class="class-text">
                  {{ room.course }}
                </div>
              </el-card>
              <template v-for="(data, index) in popuplist">
                <div :key="index">
                  <el-card class="box-card">
                    <div slot="header" class="clearfix">
                      <span>{{ room.course }}</span>
                      <el-button 
                        @click="deleteClass(room.cid)"
                        style="float: right; padding: 3px 0"
                        type="text"
                        >删除</el-button
                      >
                    </div>

                    <div
                      v-for="(item, index) in popupInterface"
                      :key="index"
                      class="text item"
                    >
                      <span>{{ item.lable }}：</span>： {{ data[item.name] }}
                    </div> 
                  </el-card>
                   <el-divider v-if=" index+1!==popuplist.length"
                      ><i class="el-icon-mobile-phone"></i
                    ></el-divider>
                </div>
              </template>
            </el-popover>
          </td>
        </tr>
      </tbody>
    </table>
    <el-dialog title="借用教室" :visible.sync="dialogFormVisible">
      <el-form :model="form">
        
        <el-form-item label="学期" :label-width="formLabelWidth">
          <el-input v-model="form.term" autocomplete="off"></el-input>
        </el-form-item>
        
        <el-form-item label="教学周" :label-width="formLabelWidth">
          <el-input v-model="form.stuWeek" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="教学楼" :label-width="formLabelWidth">
          <el-select @change="form.classRoom=''" v-model="form.place" placeholder="请选择">
            <el-option
              v-for="item in places"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="教室" :label-width="formLabelWidth">
          <el-select   v-model="form.classRoom" placeholder="请选择">
            <el-option
           
              v-for="item in addClassRooms"
              :key="item"
              :label="item"
              :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="教学楼" :label-width="formLabelWidth">
          <el-input v-model="form.place" autocomplete="off"></el-input>
        </el-form-item> --> 
        <el-form-item label="星期" :label-width="formLabelWidth"> 
          <el-select  v-model="form.weeks" placeholder="请选择">
            <el-option
              v-for="(item,index) in dates"
              :key="item"
              :label="item"
              :value="index+1">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="节数" :label-width="formLabelWidth">
          <el-input v-model="form.classTime" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="教师名" :label-width="formLabelWidth">
          <el-input v-model="form.techerName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="课程名" :label-width="formLabelWidth">
          <el-input v-model="form.course" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="subFrom">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog title="上传文件" :visible.sync="uploadVisible">
      <upload style="text-align: center" :action="uploadUrl" 
          @success="successUpload"
          @error="errorUpload"
          ref="upload" ></upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadVisible = false">取 消</el-button>
        <el-button type="primary" @click="upliadSever">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import CommonPage from "@/lib/utils/mixin/CommonPage"
import Api from "@/api/kb"
import upload from "@/components/Fileuplud"
export default { 
  ROUTER_NAME: "kb",
  ROUTER_TITLE: "课表",
  ROUTER_ICON: "el-icon-date",
  mixins: [CommonPage],
  name: "scTable",
  components: {
    upload
  },
  data() {
    return {
      uploadUrl:"http://localhost:8080/class/upload",
      daystr: [
        { name: "上午", rowspan: 4 },
        { name: "中午", rowspan: 2 },
        { name: "下午", rowspan: 4 },
        { name: "晚上", rowspan: 4 },
      ],
      tablecollen: 14,
      // 表格宽
      formLabelWidth: "120px",
      tabletdheight: 60,
      form: {
        term: "2019-2020-1",
        stuWeek: "1-17",
        place: "",
        classRoom: "",
        weeks: "",
        classTime: "1-6",
        techerName: "陈杰伟",
        course: "计算机篮球",
      },
      select:{
        place: "",
        classRoom: "",
        term:""
      },
      //教学楼选择
      dataInterface: [
        {
          name: "course",
          lable: "课程名",
        },
        {
          name: "term",
          lable: "学期",
        },
        {
          name: "stuWeek",
          lable: "教学周",
        },
        {
          name: "place",
          lable: "教学楼",
        },
        {
          name: "classRoom",
          lable: "教室",
        },
        {
          name: "weeks",
          lable: "星期几",
        },
        {
          name: "classTime",
          lable: "教学段",
        },
        {
          name: "techerName",
          lable: "教师",
        },
      ],
      dates: ["一", "二", "三", "四", "五", "六", "日"],
      terms: [],
      places: [],
      classRooms: [],
      datesindex: { cindex: 0, rindex: 0 },
      // 筛选条件
      stuWeeks: [
        {
          name: "1-17 单周",
          range: [1, 17],
          single: true,
        },
        {
          name: "1-8 单周",
          range: [1, 8],
          single: true,
        },
      ],
      kbs: [],
      // 文件上传请求头
      headers: {
        "x-authorization": "",
      },
      uploadVisible:false,
      dialogFormVisible: false,
      orgndata: [
        // {
        //   cid: 1,
        //   classRoom: "MA305",
        //   classTime: "1-2",
        //   course: "C语言程序设计",
        //   place: "明德楼",
        //   stuWeek: "1-17",
        //   techerName: "郭素梅",
        //   term: "2020-2021-2",
        //   weeks: "1,4",
        // },
      ],
    }
  },
  created() {
    this.updateData()
  },
  computed: {
    // 刷新下级
    addClassRooms(){ 
      if(this.form.place==="")
        return []
      return this.classRooms.filter(v=>{
        if(this.form.place==="知行楼"){
          return v[0]==="Z"
        }else{
          return v[0]==="M"
        }
      })
    },
    selectClassRooms(){ 
      if(this.select.place==="")
        return []
      return this.classRooms.filter(v=>{
        if(this.select.place==="知行楼"){
          return v[0]==="Z"
        }else{
          return v[0]==="M"
        }
      })
    },
    popuplist() {
      const clickitem = this.nowkbs[this.datesindex.cindex][
        this.datesindex.rindex
      ]
      if (!clickitem) {
        return []
      }

      const last = clickitem.start + clickitem.len-1
      
      return this.nowkbs[this.datesindex.cindex].filter((item) => {
        if(clickitem===item){
          return true
        }
        if (item.start > last || item.start + item.len-1 < clickitem.start) {
          return false
        } //
        return true
      })
    },
    popupInterface() {
      return [...this.dataInterface].splice(0)
    },
    // eslint-disable-next-line vue/return-in-computed-property
    nowkbs() {
      const nowkbs = []
      for (let i = 0; i < this.kbs.length; i++) {
        nowkbs[i] = this.kbs[i].filter((item) => {
          return (
            // this.select.term 
            this.select.term === item.term &&
            this.select.place === item.place &&
            this.select.classRoom === item.classRoom
          )
        })
      }
      console.log("现在的课表", nowkbs)
      return nowkbs
    },
  },
  // 多影响1  1
  // 多影响1  多
  watch: {
    orgndata(val) {
      const terms = ["2020-2021-2"]
      const places = ["明德楼"]
      const classRooms = ["MA305"]
      const kbs = new Array(7)
      // 注意foreach 会忽略初始化的大小
      for (let i = 0; i < kbs.length; i++) {
        kbs[i] = new Array()
      }
      val.forEach((v) => {
        const item = v
        terms.push(v.term)
        places.push(v.place)
        classRooms.push(v.classRoom)
        const weeks = v.weeks.split(",")
        const classTime = v.classTime.split("-").map((value) => +value)
        console.log("时间",classTime,v.classTime.split("-")) 
        item.weeks = weeks[0]
        item.start = classTime[0]
        item.len = classTime[1] - item.start + 1
        weeks.forEach((index) => {
          kbs[index].push(item)
        })
      })
      this.kbs = kbs
      this.classRooms = [...new Set(classRooms)]
      this.places = [...new Set(places)]
      this.terms = [...new Set(terms)]
      console.log(kbs, this.terms, "a111")
    },
  },
  methods: { 
    async updateData(){
      const ans = await Api.getAllClass()
      this.orgndata = ans.classlist
      console.log(ans, "请求到的数据")
    },
    successUpload(data){
      this.$message({
        message: data.message,
        type: "success"
      })
      
      this.uploadVisible = false
    },
    errorUpload(data){
      this.$message({
        message: data.message,
        type: "error"
      }) 
    },
    async deleteClass(cid){
      const res = await Api.deleteClassById({cid})
      this.$message({
        message: "恭喜你，删除成功",
        type: "success"
      })
      this.orgndata = res.data 
      console.log("删除了")
    },
    handleClass(cindex, rindex) {
      console.log("触发了")
      this.datesindex = { cindex, rindex }
    },
    upliadSever(){
      this.$refs.upload.submitUpload()
    },
    setKebs() {},
    async subFrom() {
      const ans = await Api.addClass(this.form)
      this.$message({
        message: "恭喜你，插入成功",
        type: "success"
      })
      this.orgndata = ans.classlist  
      this.dialogFormVisible = false
    },
  },
}
</script>
<style scoped >
tr >>> td {
  vertical-align: inherit;
  text-align: center;
}
.td-div {
  vertical-align: inherit;
  text-align: center; 
}
.table-col-td-div {
  display: flex;
  flex-direction: column;
}
.class-item {
  position: absolute;
  left: 0px;
  border-radius: 5px;
  width: 80%;
  margin: 0 10%;
  overflow: hidden;
}
.class-farther {
  position: relative;
}
.class-text {
  color: white;
}

 .upload-demo >>>{
  text-align: center;
}
</style>
