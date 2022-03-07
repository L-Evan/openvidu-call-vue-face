import request from "./network"


class Api {
   /**
      * 
      * @param {userId} 账号 
      * @param {password} 密码 
      * @returns 
      */
   //  addClass = (data = {
   //    term: "2019-2020-1",
   //    stuWeek: "1-17",
   //    place: "知行喽",
   //    classRoom: "Mb102",
   //    weeks: "1,2,3",
   //    classTime: "1-6",
   //    techerName: "陈杰伟",
   //    course: "计算机篮球",
   //  } ) => request.post("/class/addclasss", data);
   updateUser = (data = {
     userId: "",
     username: "",
     aclass: "",
     afaculty: "",
     avatar: ""
   }) => request.post("/updateUserByaID", data);

   deleteUser = (data = {
     userid: ""
   }) => request.post("/deleteUserByaID", data);


    
   getAllUserRole = () => request.post("/findAllUserRole");
   getAllUser = () => request.post("/findAllUser");

}
export default new Api()