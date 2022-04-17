<template>
  <div class="relative">
    <div class="absolute">
      <div class="t-right-new">
        <button  @click="changeevent" type="button" class=" back btn btn-default text">
          {{ name }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
  },
  methods: {
    changeevent: function () {
      this.$emit("click")
    },
  },
}
</script>

<style scoped>
.t-right-new .text {
  font-size: 0.5em;
  line-height: 0.5em;
  margin: 0;
}

.relative {
  position: relative;
  /* width: 25px;
    height:25px; */
  /* height: 65px; */
  top: 0px;
  left: 0pc;
  background-color: white;
}
.absolute {
  width: 100px;
  height: 65px;
  overflow: hidden;
  position: absolute;
  top: 0px;
  left: 0px;
}
.back{
  background-color: rgba(255,255,255,0);
    border-color: rgba(255,255,255,0);
    margin-top: 3px !important;

}
.t-right-new {
  position: absolute;
  width: 167px;
  height: 19px;
  background-color: #999;
  color: white;
  text-align: center;
  transform: rotate(-45deg);
  top: 10px;
  left: -64px;
}
</style>