import request from "@/api/network"
const getToken = (data = {
  sessionName: ""
} ) => request.post("/api-sessions/get-token", data)

const getHistory = (data ) => request.post("/api-sessions/getHistory", data)
const getMeetFaces = (data ) => request.post("/api-sessions/getMeetFaces", data,false)

export default {getToken,getHistory,getMeetFaces}