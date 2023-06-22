<script setup>

</script>

<template>
  <div class="temp-controls">
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
  </div>
</template>

<style scoped>
.temp-controls {
  display: flex;
  flex-direction: column;
  gap: 30px;
  width: 100%;
}

.temp-controls__bulbs {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
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
  gap: 30px;
}

.temp-controls__btn {
  width: 100%;
  font-size: 46px;
  line-height: 46px;
  color: #ffffff;
}
</style>
