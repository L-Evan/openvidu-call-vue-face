import request from "@/api/network"
const getToken = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/get-token", data)

const removeMeetToken = (data = {
  sessionName: "",
  token: ""
} ) => request.post("/api-sessions/remove-user", data,false)

const exit = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/exit", data)

const saveFaceData = (data = {
  sessionName: "",
  facesData:""
} ) => request.post("/api-sessions/saveFaceData", data,false)
const getHistory = (data ) => request.post("/api-sessions/getHistory", data)

export default {getToken,removeMeetToken,exit,saveFaceData,getHistory}  