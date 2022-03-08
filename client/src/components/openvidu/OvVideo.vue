<template>
	<video autoplay/>
</template>

<script>
export default {
  name: "OvVideo",

  props: {
    streamManager: Object,
  },
  mounted () {
    //  事件通过el获取 video  然后更新视频流，监控每次streamManager更改
    this.streamManager.addVideoElement(this.$el)
  },
}
</script>
