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
    streamManager: Object,
  },

  computed: {
    clientData () {
      const { clientData } = this.getConnectionData()
      return clientData
    },
  },
  methods: {
    getConnectionData () {
      const { connection } = this.streamManager.stream
      // json格式
      const jsonData = connection.data
      const [clientDataJson,serverDataJson] = jsonData.split("%/%")
      console.log(clientDataJson,serverDataJson,"new vedio")
      return JSON.parse(clientDataJson)
    },
  },
}
</script>
