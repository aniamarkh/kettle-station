<script setup>
defineProps({
  isConnectedMessage: Boolean,
  isConnecting: Boolean,
  isError: Boolean,
})
</script>

<template>
  <div class="kettle-panel__status">
    <Transition mode="out-in">
      <h3 v-if="isConnecting && !isError">👀 connecting 👀</h3>
      <h3 v-else-if="isConnectedMessage">✨ connected 💫</h3>
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