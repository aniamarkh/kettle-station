<script setup>
import { computed, ref } from 'vue';

const warmBtn = ref(false);

const warmBtnClass = computed(() => {
  return warmBtn.value ? 'temp-controls__warm-btn temp-controls__warm-btn--active' : 'temp-controls__warm-btn';
})

</script>

<template>
  <div class="kettle-panel__temp-controls">
    <div class="temp-controls__bulbs">
      <div class="bulbs__item bulbs__item--active"></div>
      <div class="bulbs__item bulbs__item--active"></div>
      <div class="bulbs__item"></div>
      <div class="bulbs__item"></div>
    </div>
    <div class="temp-controls__btns">
      <button class="temp-controls__btn">−</button>
      <button class="temp-controls__btn">+</button>
    </div>
    <button @click="warmBtn = !warmBtn" :class="warmBtnClass">keep warm</button>
  </div>
</template>

<style scoped>
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
  background-color: #ffffff57;
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
  color: #ffffff;
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

@media (max-height: 670px) {
  .temp-controls__btns {
    margin-top: -10px;
  }

  .kettle-panel__temp-controls {
gap: 30px;
}

}
</style>
