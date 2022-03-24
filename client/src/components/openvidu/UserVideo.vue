<template>
<div v-if="streamManager">
	<ov-video :stream-manager="streamManager"/>
	<div><p>{{ clientData }}</p></div>
</div>
</template>

<script>
import OvVideo from "@/components/openvidu/OvVideo"

export default {
  name: "UserVideo",
  components: {
    OvVideo,
  },
  props: {
    streamManager: Object
  },
  computed: {
    clientData () {
      const { clientData } = this.getConnectionData()
      return clientData
    }
  },
  methods: {
    getConnectionData () {
      console.log("vedio流",this.streamManager?.stream)
      // json格式
      const jsonData = this.streamManager?.stream?.connection?.data
      if(!jsonData){
        return ""
      }
      const clientDataJson = jsonData.split("%/%")[0]
      // console.log(clientDataJson,serverDataJson,"new vedio")
      return JSON.parse(clientDataJson)
    }
  }
}
</script>
