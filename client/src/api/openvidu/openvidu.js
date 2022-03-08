import request from "@/api/network"
const getToken = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/get-token", data)

const removeToken = (data = {
  sessionName: "",
  token: ""
} ) => request.post("/api-sessions/remove-user", data)

export  {getToken,removeToken}  