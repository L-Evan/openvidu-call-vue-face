import request from "@/api/network"
const getToken = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/get-token", data)

const removeToken = (data = {
  sessionName: "",
  token: ""
} ) => request.post("/api-sessions/remove-user", data)

const exit = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/exit", data)

const saveFaceData = (data = {
  sessionName: "",
  facesData:""
} ) => request.post("/api-sessions/exit", data)


export default {getToken,removeToken,exit,saveFaceData}  