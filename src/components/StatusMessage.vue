<script setup>
defineProps({
  isSuccess: Boolean,
  isError: Boolean,
})
</script>

<template>
  <div class="kettle-panel__status">
    <Transition>
      <h3 v-if="isSuccess">✨ success 💫</h3>
      <h3 v-else-if="isError"> 🤡 error 🤡 </h3>
    </Transition>
  </div>
</template>

<style>
.kettle-panel__status {
  display: flex;
  align-items: center;
  flex-direction: column;
  height: 30px;
}
</style>