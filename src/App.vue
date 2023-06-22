<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';

const isConnected = ref(false);
const ledData = ref({});
let socket;

const powerBtnClass = computed(() => {
  return ledData.value.led_power ? 'kettle-panel__power-btn kettle-panel__power-btn--active' : 'kettle-panel__power-btn';
});

const warmBtnClass = computed(() => {
  return ledData.value.led_keepwarm.value ? 'temp-controls__warm-btn temp-controls__warm-btn--active' : 'temp-controls__warm-btn';
});

const bulbsClass = computed(() => {
  const { led_70, led_80, led_90, led_100 } = ledData.value;
  const ledValues = [led_70, led_80, led_90, led_100];

  return ledValues.map(led => led ? 'bulbs__item bulbs__item--active' : 'bulbs__item');
});

onMounted(() => {
  socket = new WebSocket("wss://localhost:8080");

  socket.onopen = () => {
    isConnected.value = true;
  }

  socket.onmessage = event => {
    const data = JSON.parse(event.data);
    ledData.value = data;
  }

  socket.onclose = () => {
    isConnected.value = false;
  }

  socket.onerror = error => {
    console.error(`WebSocket Error: ${error}`);
  }
});

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
});

let id = 0;
const toggleBtn = (btnId) => {
  if (isConnected.value) socket.send(JSON.stringify({ o: 'button_press', d: btnId, i: ++id }));
};

</script>

<template>
  <main class="kettle-panel">
    <div class="kettle-panel__temp-controls">
      <div class="temp-controls__bulbs">
        <div :class="bulbsClass[0]"></div>
        <div :class="bulbsClass[1]"></div>
        <div :class="bulbsClass[2]"></div>
        <div :class="bulbsClass[3]"></div>
      </div>
      <div class="temp-controls__btns">
        <button @click="toggleTempDown(1)" :disabled="!isConnected" class="temp-controls__btn">−</button>
        <button @click="toggleTempUp(2)" :disabled="!isConnected" class="temp-controls__btn">+</button>
      </div>
      <button @click="toggleBtn(3)" :class="warmBtnClass" :disabled="!isConnected">keep warm</button>
    </div>
    <button @click="toggleBtn(0)" :class="powerBtnClass" :disabled="!isConnected"></button>
  </main>
</template>

<style scoped>
.kettle-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 120px 30px 100px;
}

.kettle-panel__temp-controls {
  display: flex;
  flex-direction: column;
  gap: 60px;
  align-items: center;
  justify-content: flex-start;
  height: calc(100% - 150px);
  width: 240px;
}

.temp-controls__bulbs {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.bulbs__item {
  background-color: #ffffff2c;
  box-shadow: 0px 0px 20px -4px #690c39d3;
  width: 35px;
  height: 35px;
  border-radius: 100%;
}

.bulbs__item--active {
  background-color: #ffffff;
  box-shadow: 0px 0px 10px 5px #ffffff;
}

.temp-controls__btns {
  display: flex;
  flex-direction: row;
  margin-top: -20px;
  gap: 30px;
  width: 100%;
}

.temp-controls__btn {
  width: 100%;
  font-size: 46px;
  line-height: 46px;
}

.temp-controls__warm-btn {
  font-size: 26px;
  font-weight: bold;
  padding: 20px;
  width: 230px;
}

.temp-controls__warm-btn--active {
  box-shadow: 0px 0px 20px 10px #ffffffef;
  color: #ffffff;
}


.kettle-panel__power-btn {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  background-image: url(assets/power-off.svg);
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 80px;
}

.kettle-panel__power-btn--active {
  box-shadow: 0px 0px 30px 15px #ffffffef;
  background-image: url(assets/power-on.svg);
}

@media (max-height: 670px) {
  .kettle-panel {
    padding: 60px 30px 80px;
  }

  .temp-controls__btns {
    margin-top: -10px;
  }

  .kettle-panel__temp-controls {
    gap: 30px;
  }
}
</style>
