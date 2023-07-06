<script setup>
defineProps({
  isConnectedMessage: Object,
  isConnecting: Object,
  isError: Object,
})
</script>

<template>
  <div class="kettle-panel__status">
    <Transition mode="out-in">
      <h3 v-if="isConnecting.value && !isError.value">👀 connecting 👀</h3>
      <h3 v-else-if="isConnectedMessage.value">✨ connected 💫</h3>
      <h3 v-else-if="isError.value"> 🤡 error 🤡 </h3>
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