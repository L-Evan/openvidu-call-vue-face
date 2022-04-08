import request from "@/api/network"
const getToken = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/get-token", data)

const getHistory = (data ) => request.post("/api-sessions/getHistory", data)

export default {getToken,getHistory}  