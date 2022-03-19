import http from "@/api/openvidu/openvidu"
// request
class NetworkService {
  constructor () {
    this.http = http
    this.baseHref =
      "/" +
      (window.location.pathname.split("/")[1]
        ? window.location.pathname.split("/")[1] + "/"
        : "")
  }

  async getToken (sessionId) {
    console.log("Getting token from backend: "+sessionId)
    const {token} = await this.http.getToken({ sessionName: sessionId })
    return token
  }

  //   createSession (sessionId, openviduServerUrl, openviduSecret) {
  //     return new Promise((resolve, reject) => {
  //       const body = JSON.stringify({ customSessionId: sessionId })
  //       const options = {
  //         headers: new HttpHeaders({
  //           Authorization: "Basic " + btoa("OPENVIDUAPP:" + openviduSecret),
  //           "Content-Type": "application/json"
  //         })
  //       }
  //       return (
  //         this.http.post <
  //         any >
  //         (openviduServerUrl + "/openvidu/api/sessions", body, options)
  //           .pipe(
  //             catchError(error => {
  //               if (error.status === 409) {
  //                 resolve(sessionId)
  //               }
  //               if (error.statusText === "Unknown Error") {
  //                 reject({ status: 401, message: "ERR_CERT_AUTHORITY_INVALID" })
  //               }
  //               return observableThrowError(error)
  //             })
  //           )
  //           .subscribe(response => {
  //             resolve(response.id)
  //           })
  //       )
  //     })
  //   }

  //   createToken (sessionId, openviduServerUrl, openviduSecret) {
  //     return new Promise((resolve, reject) => {
  //       const body = JSON.stringify({})
  //       const options = {
  //         headers: new HttpHeaders({
  //           Authorization: "Basic " + btoa("OPENVIDUAPP:" + openviduSecret),
  //           "Content-Type": "application/json"
  //         })
  //       }
  //       return (
  //         this.http.post <
  //         any >
  //         (openviduServerUrl +
  //           "/openvidu/api/sessions/" +
  //           sessionId +
  //           "/connection",
  //         body,
  //         options)
  //           .pipe(
  //             catchError(error => {
  //               reject(error)
  //               return observableThrowError(error)
  //             })
  //           )
  //           .subscribe(response => {
  //             console.log(response)
  //             resolve(response.token)
  //           })
  //       )
  //     })
  //   }
}

export const networkService = new NetworkService()
