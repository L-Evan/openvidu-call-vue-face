<template>
  <div>
    <div>
      
    <v-chart class="chart" :option="option" />
     <div class="userImage">
       <span class="title">用户图片</span>
        <el-avatar shape="square" :size="100" fit="scale-down" :src="userImage"></el-avatar>
     </div>
    </div>
    <v-chart class="chart" :option="newOption" @mouseover="showFaceInfo" />
  </div>
</template>

<script>
import { parseTime } from "@/utils/index"
import { THEME_KEY } from "vue-echarts"
import api from "@/api/openvidu/openvidu"
export default {
  ROUTER_ICON: "el-icon-s-help",
  ROUTER_TITLE: "echars",
  ROUTER_NAME: "echars",
  ROUTER_HIDDEN: true,
  name: "HelloWorld",
  provide: {
    [THEME_KEY]: "dark",
  },
  data() {
    return {
      // 用户头像
      userImage:"https://tools.jiyik.com/demo_source/demo2.jpeg",
      start: 0,
      end: 0,
      AverageName: "Average",
      //请求到后json整理后数据
      testFaceChecks: {},
      // 点到人脸的数据
      userPontToFace: {},
      // 历史 考虑迁移
      meetInfoHistory: {},
      // 均线展示数据
      averageData: {
        expressions: {
          angry: 0,
          disgusted: 0,
          fearful: 0,
          happy: 0,
          neutral: 0,
          surprised: 0,
          sad: 0,
        },
      },

      option: {
        title: {
          text: "Traffic Sources",
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
        },
        // 普通样式
        itemStyle: {},
        legend: {
          orient: "vertical",
          left: "left",
          data: [
            "angry",
            "disgusted",
            "fearful",
            "happy",
            "neutral",
            "surprised",
            "sad",
          ],
        },
        // 格式按type来  1个东西多个x  一般在一个object
        series: [
          {
            name: "Traffic Sources",
            type: "pie",
            radius: "55%",
            center: ["50%", "60%"],
            // 数据
            data: [
              { value: 0, name: "angry" },
              { value: 0, name: "disgusted" },
              { value: 0, name: "fearful" },
              { value: 0, name: "happy" },
              { value: 0, name: "neutral" },
              { value: 0, name: "happy" },
              { value: 0, name: "neutral" },
            ],
            // 高亮样式
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      },
      newOption: {
        grid: {
          top: "50px",
          left: "50px",
          right: "15px",
          bottom: "50px",
        },
        title: {
          text: "专注度曲线图",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#283b56",
            },
          },
        },
        legend: {},
        toolbox: {
          show: true,
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {},
          },
        },
        dataZoom: {
          show: false,
          start: 0,
          end: 100,
        },
        xAxis: [
          // 底部坐标
          {
            type: "category",
            boundaryGap: true,
            data: [],
          },
          // 顶部数据 准备情绪
          // {
          //   type: "category",
          //   boundaryGap: true,
          //   data: [],
          // },
        ],
        // y轴类型
        yAxis: [
          {
            type: "value",
            scale: true,
            name: "Price",
            max: 100,
            min: 0,
            // 线条粗熙
            boundaryGap: [0.2, 0.2],
          },
          {
            type: "value",
            scale: true,
            name: "Order",
            max: 1200,
            min: 0,
            boundaryGap: [0.2, 0.2],
          },
        ],
        series: [
          // {
          //   name: "Dynamic Bar",
          //   type: "bar",
          //   xAxisIndex: 1,
          //   yAxisIndex: 1,
          //   data: [],
          // }
        ],
      },
      // 时间
      // 情绪
      categories2: [],
      // 专注度
      // data:[],
      //
      // data2:[],
      sessionName: "",
      sessionId: "",
      setTimeoutContainer: null,
    }
  },
  computed: {
    showData() {
      this.updateBeforInit()
      console.log("触发了么") // JSON.parse(JSON.stringify(
      const newVal = this.testFaceChecks

      console.log(newVal)
      let minn = 30
      let maxx = 80
      let minTime = 164943945669099
      let maxTime = 0
      //----------------------------------------------------------------
      for (const userKey in newVal) {
        // Array.prototype.map
        newVal[userKey] = newVal[userKey].map((userData) => {
          // const clearData = { focusValue: 0 }
          if (userData?.focusData?.result) {
            const { checkStartTime, focusData } = userData
            const { result } = focusData
            const focusValue = Math.floor(result.toFixed(4) * 10000) / 100
            // 保存
            // clearData.focusValue = focusValue
            // clearData.checkStartTime = parseInt(userData.checkStartTime/ 5000) * 5000
            userData.focusValue = focusValue
            userData.checkStartTime =
              parseInt(userData.checkStartTime / 5000) * 5000
            // 找时间
            minTime = Math.min(checkStartTime, minTime)
            maxTime = Math.max(checkStartTime, maxTime)
            // 专注度
            maxx = Math.max(focusValue, maxx)
            minn = Math.min(focusValue, minn)
          }
          return userData
        })
      }
      console.log(`min${minTime},"max${maxTime}`)
      // return {}
      //----------------------------------------------------------------
      let x_categories = []
      const series = []
      for (
        let m = parseInt(minTime / 5000) * 5000;
        m <= parseInt(maxTime / 5000) * 5000;
        m += 5000
      ) {
        //parseTime(m, "{h}:{i}:{s}")
        x_categories.push(m)
      }
      console.log("x轴确定 ", x_categories)
      //----------------------------------------------------------------
      // 计算均值
      let focusAllValuesAverage = new Array(x_categories.length)
      const pointNumber = new Array(x_categories.length)
      // 初始化
      focusAllValuesAverage.fill(0)

      for (const userKey in newVal) {
        const userData = { type: "line", connectNulls: true }
        userData.name = userKey
        let i = 0
        const focusValues = new Array(x_categories.length)
        const preData = newVal[userKey]
        console.log(userKey + "的数据", preData)
        x_categories.forEach((time, index) => {
          if (i < preData.length && preData[i].checkStartTime == time) {
            // userKey+i 为key
            this.userPontToFace[userKey + index] = i
            //
            const pointData = preData[i++]
            focusValues[index] = pointData.focusValue
            // 均
            focusAllValuesAverage[index] += focusValues[index]
            pointNumber[index] = pointNumber[index] ? pointNumber[index] + 1 : 1
            // 二级显示数据(暂时只取第一个)
            const { currentFaces } = pointData
            if (currentFaces.length) {
              // 向前提取
              const { expressions, faceStr } = currentFaces[0].moodData
              pointData.expressions = expressions
              pointData.faceStr = faceStr
              this.averageData.expressions[faceStr]++
            }
          }
        })
        userData.data = focusValues
        // USER
        series.push(userData)
        console.log(`用户${userKey}数据：`, userData)
      }
      // 平均
      focusAllValuesAverage = focusAllValuesAverage.map(
        (value, index) => value / pointNumber[index]
      )
      console.log("平均？", focusAllValuesAverage)
      series.push({
        type: "line",
        name: this.AverageName,
        connectNulls: true,
        data: focusAllValuesAverage,
      })
      // x轴
      x_categories = x_categories.map((time) => {
        return parseTime(time, "{h}:{i}:{s}")
      })

      return {
        x_categories,
        series,
      }
    },
  },
  watch: {
    showData: {
      handler(showData) {
        this.newOption.series = showData.series
        this.newOption.xAxis[0].data = showData.x_categories
      },
    },
  },
  mounted() {
    this.initData()
    this.getFaceData()
  },
  destroyed() {
    clearTimeout(this.setTimeoutContainer)
    console.log("destroyed")
  },
  methods: {
    updateBeforInit() {
      this.averageData = {
        captureImage: "https://tools.jiyik.com/demo_source/demo2.jpeg",
        expressions: {
          angry: 0,
          disgusted: 0,
          fearful: 0,
          happy: 0,
          neutral: 0,
          surprised: 0,
          sad: 0,
        },
      }
    },
    initData() {
      this.sessionName = this.$route.query.sessionName
      this.sessionId = this.$route.query.sessionId
    },
    showFaceInfo(params) {
      console.log("试试看数据", params)
      if (params.componentType == "series" && params.seriesType == "line") {
        // var xAxisInfo = params.value[0]
        // this.testFaceChecks
        const { seriesName, dataIndex } = params
        // id
        const pointData =
          seriesName === this.AverageName
            ? this.averageData
            : this.testFaceChecks[seriesName][
              this.userPontToFace[seriesName + dataIndex]
            ]

        // 显示faceStr
        const { expressions,captureImage } = pointData
        this.userImage = captureImage
        const datas = []
        for (const str in expressions) {
          datas.push({ name: str, value: expressions[str] })
        }
        this.option.series[0].data = datas
        console.log("这个点", pointData)
      }
    },
    async getFaceData() {
      try {
        const result = await api.getMeetFaces({
          sessionId: this.sessionId,
          sessionName: this.sessionName,
        })
        console.log("获得数据", result)
        let { usersFace } = result
        const userMap = {}
        usersFace.forEach((userData) => {
          const userKey = userData.createdBy
          const converFaces = []
          const checkArrays = JSON.parse(userData.facesData)
          checkArrays.forEach((value) => {
            const checkArrays = JSON.parse(value)
            converFaces.push(...checkArrays)
          })
          userMap[userKey] = converFaces
        })
        console.log("保存的数据", userMap)
        this.testFaceChecks = userMap
      } catch (e) {
        console.log(e, "获取数据失败")
        this.setTimeoutContainer = setTimeout(this.getFaceData, 3000)
      }
    },
    async getData() {
      const result = await api.getHistory()
      const meetInfoHistory = result?.data?.meetInfoHistory
      if (meetInfoHistory?.length) {
        meetInfoHistory.forEach((value) => {
          try {
            let usersFace = JSON.parse(value.facesData)
            for (const userKey in usersFace) {
              if (usersFace[userKey]?.length) {
                // faces.formatter
                // Array.prototype.forEach
                const converFaces = []
                usersFace[userKey].forEach((value) => {
                  const checkArrays = JSON.parse(value)
                  converFaces.push(...checkArrays)
                })
                usersFace[userKey] = converFaces
              }
            }
            value.facesData = usersFace
            // 随便找个测试
            this.testFaceChecks = usersFace
          } catch (e) {
            console.log("会议转化失败", value)
          }
        })
      }
      // meetInfoHistor
      this.meetInfoHistory = meetInfoHistory

      console.log("history", result, meetInfoHistory)
    },
  },
}
</script>

<style scoped>
.chart {
  height: 400px;
}
.userImage{
  position: absolute;
    top: 75px;
    right: 143px;
}
</style> 