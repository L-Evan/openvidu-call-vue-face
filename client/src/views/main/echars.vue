<template>
  <div>
    <div style="height: 400px">
      <!-- width="100%" height="100%" -->
      <v-chart class="chart" :update-options="{notMerge:true}" ref="upEcharts" :option="upOption" />
      <div class="userImage" v-if="!isAverage">
        <span class="title">用户</span>
        <el-avatar
          shape="square"
          :size="100"
          fit="scale-down"
          :src="userImage"
        ></el-avatar>
      </div>
    </div>
    <v-chart
      style="height: calc(100% - 450px)"
      class="chart"
      :option="downOption"
      @mouseover="concentrationHandler"
    />
  </div>
</template>

<script>
import * as echarts from "echarts"

import {
  expressEToC,
  expressInit,
  CHECK_CYCLE,
} from "@/lib/utils/openvidu/openviduType"
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
      isAverage:true,

      // 用户头像
      userImage: "https://tools.jiyik.com/demo_source/demo2.jpeg",
      start: 0,
      end: 0,
      AverageName: "平均专注",
      averageAllValue:100,
      //请求到后json整理后数据
      allFaceData: {},
      // 点到人脸的数据
      userPontToFaceIndex: {},
      // 历史 考虑迁移
      meetInfoHistory: {},
      // 均线展示数据
      averageData: {
        expressions: {
          ...expressInit,
        },
      },
      avagerSeries:[ {
        name: "情绪次数",
        type: "pie",
        radius: "55%",
        center: ["50%", "60%"],
        // 数据
        data: [
          { value: 0, name: "生气" },
          { value: 0, name: "厌恶" },
          { value: 0, name: "恐惧" },
          { value: 0, name: "开心" },
          { value: 0, name: "正常" },
          { value: 0, name: "惊讶" },
          { value: 0, name: "伤心" },
        ],
        // 高亮样式
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      }],
      userPointSeries: [
        {
          name: "情绪次数",
          type: "pie",
          radius: "55%",
          center: ["32%", "50%"],
          // 数据
          data: [
            { value: 0, name: "生气" },
            { value: 0, name: "厌恶" },
            { value: 0, name: "恐惧" },
            { value: 0, name: "开心" },
            { value: 0, name: "正常" },
            { value: 0, name: "惊讶" },
            { value: 0, name: "伤心" },
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
        {
          labelLine: {
            show: false,
          },
          label: {
            formatter: "{d}%",
            position: "inner",
            fontSize: 10,
          },
          name: "固定占比",
          type: "pie",
          radius: "35%",
          // roseType: "area",
          center: ["63%", "50%"],
          // 数据 0.649118, 0.27895457, 0.07192743
          data: [
            { value:  7.19, name: "情绪" },
            { value: 64.91, name: "头部" },
            { value: 27.9, name: "疲劳" },
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
        {
          center: ["63%", "50%"],
          name: "专注度",
          type: "pie",
          radius: ["45%", "60%"],
          labelLine: {
            length: 30,
          },
          label: {
            formatter: "{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c}  {per|{d}%}  ",
            backgroundColor: "#F6F8FC",
            borderColor: "#8C8D8E",
            borderWidth: 1,
            borderRadius: 4,
            rich: {
              a: {
                color: "#6E7079",
                lineHeight: 22,
                align: "center",
              },
              hr: {
                borderColor: "#8C8D8E",
                width: "100%",
                borderWidth: 1,
                height: 0,
              },
              b: {
                color: "#4C5058",
                fontSize: 14,
                fontWeight: "bold",
                lineHeight: 33,
              },
              per: {
                color: "#fff",
                backgroundColor: "#4C5058",
                padding: [3, 4],
                borderRadius: 4,
              },
            },
          },
          data: [
            { value: 0, name: "情绪" },
            { value: 0, name: "头部" },
            { value: 0, name: "疲劳" },
          ],
        },
      ],
      optionSerData: {
        name: "情绪次数",
        type: "pie",
        radius: "55%",
        center: ["50%", "60%"],
        // 数据
        data: [
          { value: 0, name: "生气" },
          { value: 0, name: "厌恶" },
          { value: 0, name: "恐惧" },
          { value: 0, name: "开心" },
          { value: 0, name: "正常" },
          { value: 0, name: "惊讶" },
          { value: 0, name: "伤心" },
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
      upOption: {
        // 外边距
        grid:{},
        title: {
          text: "会议信息",
          left: "center",
          y:25
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
            "正常",
            "开心",
            "伤心",
            "生气",
            "惊讶",
            "厌恶",
            "恐惧",
            "疲劳",
            "情绪",
            "头部",
          ],
        },
        // 格式按type来  1个东西多个x  一般在一个object
        series: [{
          name: "情绪次数",
          type: "pie",
          radius: "55%",
          center: ["50%", "50%"],
          // 数据
          data: [
            { value: 0, name: "生气" },
            { value: 0, name: "厌恶" },
            { value: 0, name: "恐惧" },
            { value: 0, name: "开心" },
            { value: 0, name: "正常" },
            { value: 0, name: "惊讶" },
            { value: 0, name: "伤心" },
          ],
          // 高亮样式
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        }],
      },
      downOption: {
        grid: {
          top: "50px",
          left: "50px",
          right: "50px",
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
        dataZoom: [
          {
            show: true,
            type: "slider",
            top: "95%",
            start: 0,
            end: 100,
          },
        ],
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
            max: 100,
            min: 0,
            boundaryGap: [0.2, 0.2],
            axisLabel: {
              formatter: function (value) {
                var res = ""
                var texts = ""
                if (value == 100) {
                  texts = "极高"
                } else if (value >= 80) {
                  texts = "较高"
                } else if (value >= 60) {
                  texts = "普通"
                } else if (value >= 40) {
                  texts = "较低"
                } else if (value >= 20) {
                  texts = "低下"
                } else if (value >= 0) {
                  texts = "极低"
                }
                res = res + texts
                return res
              },
            },
          },
        ],
        series: [
        ],
      },
      // 时间
      // 情绪
      categories2: [],
      // 专注度
      sessionName: "",
      sessionId: "",
      setTimeoutGetData: undefined,
    }
  },
  computed: {
    updatePointData() {
      // 初始化上表
      this.updateBeforInit()
      const echarsData = this.allFaceData
      console.log(echarsData)
      let minFocus = 30
      let maxFocus = 80
      let minTime = 164943945669099
      let maxTime = 0
      //----------------------------------------------------------------
      for (const userKey in echarsData) {
        echarsData[userKey] = echarsData[userKey].map((userData) => {
          // const clearData = { focusValue: 0 }
          if (userData?.focusData) {
            const { checkStartTime, focusData } = userData
            const { result } = focusData
            const focusValue = this.parseIntFace(result)
            // 保存
            // clearData.focusValue = focusValue
            // clearData.checkStartTime = parseInt(userData.checkStartTime/ 5000) * 5000
            userData.focusValue = focusValue
            userData.checkStartTime =
              parseInt(userData.checkStartTime / CHECK_CYCLE) * CHECK_CYCLE
            // 找时间
            minTime = Math.min(checkStartTime, minTime)
            maxTime = Math.max(checkStartTime, maxTime)
            // 专注度
            maxFocus = Math.max(focusValue, maxFocus)
            minFocus = Math.min(focusValue, minFocus)
          }
          return userData
        })
      }
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
      // 默认数组没值为空数据 所以无需fill
      const yUserPointCount = new Array(x_categories.length)
      // 初始化
      focusAllValuesAverage.fill(0)
      const zeroTimePoint = {}

      for (const userKey in echarsData) {
        const userData = {
          // smooth: true,
          // 太丑了不搞了
          // markPoint: {
          //   data: [
          //     { type: "min", name: "Min" }
          //   ]
          // },
          type: "line",
          connectNulls: true,
        }
        userData.name = userKey
        let len = 0
        const focusValues = new Array(x_categories.length)
        const preData = echarsData[userKey]
        console.log(userKey + "的数据", preData)
        x_categories.forEach((time, index) => {
          if (len < preData.length && preData[len].checkStartTime == time) {
            // userKey+i 为key
            this.userPontToFaceIndex[userKey + index] = len
            //
            const pointData = preData[len++]
            focusValues[index] = pointData.focusValue
            // 零点
            if(pointData.focusValue===0){
              const x = parseTime(time, "{h}:{i}:{s}")
              const ex = parseTime(time+5000, "{h}:{i}:{s}")
              if(zeroTimePoint[x]){
                zeroTimePoint[x].count++
              }else {
                zeroTimePoint[x] = {
                  count:1,
                  value:[{
                    name: userKey,
                    xAxis: x
                  },{
                    name: userKey,
                    xAxis: ex
                  }]
                }
              }
            }
            // 均专注
            focusAllValuesAverage[index] += focusValues[index]
            yUserPointCount[index] = yUserPointCount[index]
              ? yUserPointCount[index] + 1
              : 1

            const { currentFaces } = pointData
            // 存储时间点情绪
            pointData.expressions = { ...expressInit }
            currentFaces.forEach((value) => {
              // expressions 是概率
              const { faceStr } = value.moodData
              this.averageData.expressions[faceStr]++
              pointData.expressions[faceStr]++
            })
          }
        })
        userData.data = focusValues
        // USER
        series.push(userData)
        console.log(`用户${userKey}数据：`, userData)
      }
      // 总平均值
      let timePointCount = 0
      let averageAllValue = 0
      // 计算所有平均值平均
      focusAllValuesAverage = focusAllValuesAverage.map(
        (value, index) => {
          const focusThat = value / yUserPointCount[index]
          if(focusThat){
            averageAllValue+=focusThat
            timePointCount++
          }
          return focusThat
        }
      )
      if(timePointCount) {
        averageAllValue /= timePointCount
      }
      console.log("需要标红：",Object.values(zeroTimePoint).map(item=>{
        if(item.count!==1){
          item.value.name=`${item.value.name} 等 ${item.count} 人`
        }
        return item.value
      }))
      series.push({
        smooth: true,
        // symbol: "none",
        type: "line",
        name: this.AverageName,
        connectNulls: true,
        data: focusAllValuesAverage,
        // 标红 太丑了暂时不用
        // markArea: {
        //   itemStyle: {
        //     color: "rgba(255, 173, 177, 0.4)"
        //   },
        //   data: Object.values(zeroTimePoint).map(item=>{
        //     if(item.count!==1){
        //       item.value.name=`${item.value.name} 等 ${item.count} 人`
        //     }
        //     return item.value
        //   })
        // }
      })
      series.push({
        type: "bar",
        name: this.AverageName + "柱状图",
        connectNulls: true,
        data: focusAllValuesAverage,
        itemStyle: {
          borderRadius: 5,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#14c8d4" },
            { offset: 1, color: "#43eec6" },
          ]),
        },
      })
      // x轴
      x_categories = x_categories.map((time) => {
        return parseTime(time, "{h}:{i}:{s}")
      })
      return {
        x_categories,
        series,
        averageAllValue
      }
    },
  },
  watch: {
    updatePointData: {
      handler(computerData) {
        this.downOption.series = computerData.series
        this.downOption.xAxis[0].data = computerData.x_categories
        this.averageAllValue = computerData.averageAllValue
      },
    },
  },
  mounted() {
    // this.$refs.myChart && this.$refs.myChart.mergeOptions(this.option, true)
    this.initData()
    this.getAllFaceData()
  },
  destroyed() {
    this.setTimeoutGetData = null
    clearTimeout(this.setTimeoutGetData)
  },
  methods: {
    parseIntFace(value) {
      return value ? parseInt(value.toFixed(2) * 100) : value
    },
    /**
     * 初始化属性
     */
    updateBeforInit() {
      this.averageAllValue = 0
      this.averageData = {
        captureImage: "https://tools.jiyik.com/demo_source/demo2.jpeg",
        expressions: {
          ...expressInit,
        },
      }
    },
    initData() {
      this.sessionName = this.$route.query.sessionName
      this.sessionId = this.$route.query.sessionId
    },
    concentrationHandler(params) {
      console.log("触发事件", params)
      if (params.componentType == "series" && params.seriesType == "line") {
        // var xAxisInfo = params.value[0]
        const { seriesName, dataIndex } = params
        // id
        this.isAverage = seriesName === this.AverageName
        const pointData = this.isAverage
          ? this.averageData
          : this.allFaceData[seriesName][
            this.userPontToFaceIndex[seriesName + dataIndex]
          ]

        // 显示faceStr
        const { expressions, captureImage, focusData,focusValue } = pointData
        this.userImage = captureImage
        const datas = []
        for (const str in expressions) {
          datas.push({ name: expressEToC[str], value: expressions[str] })
        }
        this.upOption.title.text = seriesName+"："+parseInt(this.averageAllValue)
        if (this.isAverage) {
          this.upOption.series = [...this.avagerSeries]
          this.upOption.series[0].data = datas
          // this.$refs["upEcharts"].setOption(this.option,true)
          //this.option.series[1].name = "情绪次数南丁格尔图"
          //this.option.series[1].data = datas
        } else if (focusData) {
          this.upOption.series = [...this.userPointSeries]
          this.upOption.series[0].data = datas
          this.upOption.series[2].name = "专注度评分："+focusValue
          this.upOption.series[2].data = [
            { value: this.parseIntFace(focusData.mood), name: "情绪" },
            {
              value: this.parseIntFace(focusData.headTurnDegree),
              name: "头部",
            },
            { value: this.parseIntFace(focusData.fatigue), name: "疲劳" },
          ]
        }
        console.log("此点数据：", pointData)
      }
    },
    async getAllFaceData() {
      try {
        const result = await api.getMeetFaces({
          sessionId: this.sessionId,
          sessionName: this.sessionName,
        })
        console.log("请求数据结果：", result)
        let { usersFace, havaData } = result
        if (!havaData) {
          this.$alert("没有采集到数据", "会议信息", {
            confirmButtonText: "确定",
            callback: () => {
              this.$router.go(-1)
            },
          })
          return
        }
        this.transferToUserMap(usersFace)
      } catch (e) {
        console.log(e, "请求数据失败")
        // 组件是否被
        if (this.setTimeoutGetData === null) {
          console.log("组件已经被销毁")
          return
        }
        this.setTimeoutGetData = setTimeout(this.getAllFaceData, 3000)
      }
    },
    transferToUserMap(usersFace) {
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
      this.allFaceData = userMap
    },
  },
}
</script>

<style scoped>
.title {
  display: block;
  color: white;
  text-align: center;
  margin: 10px;
}
.chart {
  height: 400px;
}
.userImage {
  position: absolute;
  top: 75px;
  right: 143px;
}
</style> 