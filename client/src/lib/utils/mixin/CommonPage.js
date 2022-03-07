import allStroy from "@/lib/utils/localStrory" 

export default {
  data() {
    return {
      
      token: allStroy.getToken(),
      time: [
        ["8:00", "8:45"],
        ["8:50", "9:35"],
        ["9:55", "10:40"],
        ["10:45", "11:30"],
        ["11:40", "12:25"],
        ["12:30", "13:15"],
        ["14:00", "14:45"],
        ["14:50", "15:35"],
        ["15:55", "16:40"],
        ["16:45", "17:30"],
        ["18:40", "19:25"],
        ["19:30", "20:15"],
        ["20:25", "21:10"],
        ["21:15", "22:00"]],
      ColorList: [{
        title: "嫣红",
        name: "red",
        color: "#e54d42"
      },
      {
        title: "桔橙",
        name: "orange",
        color: "#f37b1d"
      },
      {
        title: "明黄",
        name: "yellow",
        color: "#fbbd08"
      },
      {
        title: "橄榄",
        name: "olive",
        color: "#8dc63f"
      },
      {
        title: "森绿",
        name: "green",
        color: "#39b54a"
      },
      {
        title: "天青",
        name: "cyan",
        color: "#1cbbb4"
      },
      {
        title: "海蓝",
        name: "blue",
        color: "#0081ff"
      },
      {
        title: "姹紫",
        name: "purple",
        color: "#6739b6"
      },
      {
        title: "木槿",
        name: "mauve",
        color: "#9c26b0"
      },
      {
        title: "桃粉",
        name: "pink",
        color: "#e03997"
      },
      {
        title: "棕褐",
        name: "brown",
        color: "#a5673f"
      },
      {
        title: "玄灰",
        name: "grey",
        color: "#8799a3"
      },
      {
        title: "草灰",
        name: "gray",
        color: "#aaaaaa"
      },
      {
        title: "墨黑",
        name: "black",
        color: "#333333"
      },
      {
        title: "雅白",
        name: "white",
        color: "#ffffff"
      },],
    }
  }, methods: {
    setToken: allStroy.setToken,
    goPage(name){
      this.$router.push({name})
    },
    goBack() {
      window.history.go(-1)
    }
  }
}