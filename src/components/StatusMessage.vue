<script setup lang="ts">
import { STATUS_VALUE } from '../types';

defineProps({
  status: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div class="kettle-panel__status">
    <Transition mode="out-in">
      <h3 v-if="status === STATUS_VALUE.CLOSED">😴 no connection 💤</h3>
      <h3 v-else-if="status === STATUS_VALUE.CONNECTING">👀 connecting 👀</h3>
      <h3 v-else-if="status === STATUS_VALUE.CONNECTED">✨ connected 💫</h3>
      <h3 v-else-if="status === STATUS_VALUE.ERROR">🤡 error 🤡</h3>
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
