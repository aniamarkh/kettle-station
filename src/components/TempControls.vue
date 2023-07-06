<script setup>
import { computed } from 'vue';

const props = defineProps({
  isConnected: Object,
  isWaitingForResponse: Object,
  ledData: Object,
  disableBtns: Boolean
});

const emit = defineEmits(['toggle-btn']);

const warmBtnClass = computed(() => {
  return props.ledData.led_keepwarm && props.isConnected ? 'temp-controls__warm-btn temp-controls__warm-btn--active' : 'temp-controls__warm-btn';
});

const bulbsClass = computed(() => {
  const { led_70, led_80, led_90, led_100 } = props.ledData;
  const ledValues = [led_70, led_80, led_90, led_100];

  return ledValues.map(led => led && props.isConnected ? 'bulbs__item bulbs__item--active' : 'bulbs__item');
});

const toggleBtn = (btnId) => {
  emit('toggle-btn', btnId);
};
</script>

<template>
  <div class="kettle-panel__temp-controls">
    <div class="temp-controls__bulbs">
      <div :class="bulbsClass[0]"></div>
      <div :class="bulbsClass[1]"></div>
      <div :class="bulbsClass[2]"></div>
      <div :class="bulbsClass[3]"></div>
    </div>
    <div class="temp-controls__btns">
      <button @click="toggleBtn(1)" :disabled="disableBtns" class="temp-controls__btn">−</button>
      <button @click="toggleBtn(2)" :disabled="disableBtns" class="temp-controls__btn">+</button>
    </div>
    <button @click="toggleBtn(3)" :class="warmBtnClass" :disabled="disableBtns">keep warm</button>
  </div>
</template>

<style scoped>
.kettle-panel__temp-controls {
  display: flex;
  flex-direction: column;
  gap: 40px;
  align-items: center;
  justify-content: flex-start;
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
</style>