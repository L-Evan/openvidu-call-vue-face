<template>
  <v-chart class="chart" :option="option" />
</template>

<script>
import { THEME_KEY } from "vue-echarts"

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
        itemStyle:{},
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
    }
  },
}
</script>

<style scoped>
.chart {
  height: 400px;
}
</style> 