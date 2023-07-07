<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue';
import type { Ref } from 'vue';
import SocketManager from '../managers/socket.js';
import StatusManager from '../managers/status.js';
import StatusMessage from './StatusMessage.vue';
import TempControls from './TempControls.vue';
import type { LedData } from '../types';

const props = defineProps({
  password: String,
});
const emit = defineEmits(['on-incorrect-password']);

const ledData: Ref<LedData> = ref({
  led_power: 0,
  led_70: 0,
  led_80: 0,
  led_90: 0,
  led_100: 0,
  led_keepwarm: 0,
});

const updateLedData = (data: LedData) => (ledData.value = data);

const statusManager = new StatusManager();
const connection = new SocketManager(
  props.password,
  () => emit('on-incorrect-password'),
  updateLedData,
  statusManager
);

onMounted(() => connection.initializeWebSocket());

onUnmounted(() => {
  if (connection) {
    connection.close();
  }
});

const powerBtnClass = computed(() => {
  return ledData.value.led_power
    ? 'kettle-panel__power-btn kettle-panel__power-btn--active'
    : 'kettle-panel__power-btn';
});

const disableBtns = computed(() => {
  return (
    !statusManager.currentStatus.value ||
    statusManager.currentStatus.value === 'closed' ||
    statusManager.currentStatus.value === 'connecting' ||
    statusManager.currentStatus.value === 'awaiting'
  );
});

const toggleButton = (buttonId: number) => {
  connection.onButtonPress(buttonId);
};
</script>

<template>
  <div class="kettle-panel">
    <StatusMessage :current-status="statusManager.currentStatus.value" />
    <TempControls :led-data="ledData" :disable-btns="disableBtns" @toggle-btn="toggleButton" />
    <button @click="toggleButton(0)" :class="powerBtnClass" :disabled="disableBtns"></button>
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
