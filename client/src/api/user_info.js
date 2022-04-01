import request from "./network"

class Api {
    /**
     * 
     * @param {userId} 账号 
     * @param {password} 密码 
     * @returns 
     */
    register = (data = {
      userId: "13430050201",
      password: 12345678,
      aClass: "",
      aTel: "",
      aFaculty: "",
    } ) => request.post("/user/register", data);
    /**
     * 
     * @param {*} data 
     * @returns 
     */
     login = (data={
       userId:"",
       password:""
     }) => request.post("/user/passwordLogin", data);

     getInfo = () => request.get("/user/getinfo",{},false );
      
     logout = ()=> request.get("/user/logout", {});
  
}
const api = new Api() 
export default api