import request from "@/api/network"
export const OneSignUsers = (data = {
  username: ""
} ) => request.get("/OneUserSignServlet", data)


export const showAllSignUser = () => request.get("/UserSignServlet")
export const showAllMessage = () => request.get("/Messageshow")

export const addUserInfo = (data= {
  username: "",
  signdate: "",
  signlocation: "",
}) => request.post("/addUserInfo",data)


export default {
  OneSignUsers,showAllSignUser,addUserInfo,showAllMessage
}