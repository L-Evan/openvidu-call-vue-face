import request from "@/api/network"
 

export const testRota = (data={
  "term":"",
  "place":"",
  "stuWeek":"",
  "weeks":""
}) => request.get("/testRota",data)

export const testOutput = (data={
  "place":"",
  "startTime":"",
  "endTime":"",
  "classRoom":"",
}) => request.get("/testOutput",data)

export const testRepair = (data={
  "place":"",
  "startTime":"",
  "endTime":"",
  "classRoom":"",
}) => request.get("/testRepair",data)

export default {
  testRota ,testOutput,testRepair
}