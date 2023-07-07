<script setup lang="ts">
import { onMounted, computed, onUnmounted } from 'vue';
import Kettle from '../managers/kettle.js';
import WebSocketManager from '../managers/socket.js';
import { BUTTON_ID } from '../types';
import TempControls from './TempControls.vue';
import StatusMessage from './StatusMessage.vue';

const props = defineProps({
  password: {
    type: String,
    required: true,
  },
});
const emit = defineEmits(['on-incorrect-password']);

const connection: WebSocketManager = new WebSocketManager(props.password, () =>
  emit('on-incorrect-password')
);
const kettle: Kettle = new Kettle(connection);

onMounted(() => kettle.init());
onUnmounted(() => kettle.disconnect());

const powerBtnClass = computed(() => {
  return kettle.ledStatus.value.led_power && kettle.isLedsOn.value
    ? 'kettle-panel__power-btn kettle-panel__power-btn--active'
    : 'kettle-panel__power-btn';
});
</script>

<template>
  <div class="kettle-panel">
    <StatusMessage :status="kettle.connection.status.value" />
    <TempControls :kettle="kettle" />
    <button
      @click="kettle.pressButton(BUTTON_ID.BTN_POWER)"
      :class="powerBtnClass"
      :disabled="kettle.isButtonsDisabled.value"
    ></button>
  </div>
</template>

<style scoped>
.kettle-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 50px;
  height: 100%;
  width: 100%;
  padding-bottom: 50px;
}

.kettle-panel__power-btn {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  background-image: url(../assets/power-off.svg);
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 80px;
}

.kettle-panel__power-btn--active {
  box-shadow: 0px 0px 30px 15px #ffffffef;
  background-image: url(../assets/power-on.svg);
}
</style>
