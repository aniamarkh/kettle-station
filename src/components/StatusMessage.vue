<script setup>
defineProps({
  currentStatus: String,
})
</script>
<template>
  <div class="kettle-panel__status">
    <Transition mode="out-in">
      <h3 v-if="currentStatus === 'closed'">😴 no connection 💤</h3>
      <h3 v-else-if="currentStatus === 'connecting'">👀 connecting 👀</h3>
      <h3 v-else-if="currentStatus === 'connected'">✨ connected 💫</h3>
      <h3 v-else-if="currentStatus === 'error'"> 🤡 error 🤡 </h3>
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