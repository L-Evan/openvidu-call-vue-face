<template>
  <div class="relative">
    <div class="absolute">
      <div class="t-right-new">
        <button @click="changeevent" type="button" class="btn btn-default text">
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

<style>
</style>