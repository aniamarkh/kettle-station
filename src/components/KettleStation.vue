<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';
import SocketManager from '../managers/socket.js';
import StatusMessage from './StatusMessage.vue';
import TempControls from './TempControls.vue';

const props = defineProps({
  password: String,
});
const emit = defineEmits(['on-incorrect-password']);

const ledData = ref({
  led_power: 0,
  led_70: 0,
  led_80: 0,
  led_90: 0,
  led_100: 0,
  led_keepwarm: 0
});

const updateLedData = (data) => ledData.value = data;

const connection = new SocketManager(
  props.password,
  () => emit('on-incorrect-password'),
  updateLedData);

onMounted(() => connection.initializeWebSocket());

onUnmounted(() => {
  if (connection) {
    connection.close();
  }
});

const powerBtnClass = computed(() => {
  return ledData.value.led_power && connection.isConnected.value ? 'kettle-panel__power-btn kettle-panel__power-btn--active' : 'kettle-panel__power-btn';
});

const disableBtns = computed(() => {
  return !connection.isConnected.value || connection.isWaitingForResponse.value;
});

const toggleButton = (buttonId) => {
  connection.onButtonPress(buttonId);
};
</script>

<template>
  <div class="kettle-panel">
    <StatusMessage :is-connected-message="connection.isConnectedMessage" :is-connecting="connection.isConnecting"
      :is-error="connection.isError" />
    <TempControls :is-connected="connection.isConnected" :is-waiting-for-response="connection.isWaitingForResponse"
      :led-data="ledData" :disable-btns="disableBtns" @toggle-btn="toggleButton" />
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
