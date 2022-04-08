<template>
  <div>
    <v-chart class="chart" :option="option" />
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
  name: "HelloWorld",
  provide: {
    [THEME_KEY]: "dark",
  },
  data() {
    return {
      testFaceChecks: {},
      meetInfoHistory: {},
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
            "Direct",
            "Email",
            "Ad Networks",
            "Video Ads",
            "Search Engines",
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
              { value: 335, name: "Direct" },
              { value: 310, name: "Email" },
              { value: 234, name: "Ad Networks" },
              { value: 135, name: "Video Ads" },
              { value: 1548, name: "Search Engines" },
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
      categories: [],
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
  watch: {
    testFaceChecks: {
      handler(newVal) {
        console.log(newVal)
        const x_categories = []
        const series = []
        let minn = 30
        let maxx = 80
        for (const userKey in newVal) {
          const userData = { type: "line" }
          userData.name = userKey
          // checkStartTime
          // Array.prototype.map
          userData.data = newVal[userKey].map(
            (userData) =>{
              const zzd = Math.floor(userData?.focusData?.result.toFixed(4) * 10000) /
                100 ?? 0
              maxx = Math.max(zzd,maxx)
              minn = Math.min(zzd,minn)
              return
            }
          )
          // 临时X
          x_categories.push(
            ...newVal[userKey].map((userData) =>
              parseTime(userData.checkStartTime/5000*5000 ?? 0, "{h}:{i}:{s}")
            )
          )
          // USER
          series.push(userData)
          console.log(`用户${userKey}数据：`, userData , "x:", x_categories)
        }
        console.log(`x轴确定 ${x_categories} `)
        this.newOption.series = series
        this.newOption.xAxis[0].data = x_categories

        // this.categories = []
      },
      // deep: true
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
    initData() {
      this.sessionName = this.$route.query.sessionName
      this.sessionId = this.$route.query.sessionId
    },
    showFaceInfo(params) {
      console.log("试试看数据", params)
      if (params.componentType == "series" && params.seriesType == "line") {
        var xAxisInfo = params.value[0]
        // myChart.setOption({
        //     series: {
        //         id: 'pie',
        //         label: {
        //             formatter: '{b}: {@[' + xAxisInfo + ']} ({d}%)'
        //         },
        //         encode: {
        //             value: xAxisInfo,
        //             tooltip: xAxisInfo
        //         }
        //     }
        // });
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
        usersFace = JSON.parse(usersFace)
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
        this.testFaceChecks = usersFace
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
</style> 