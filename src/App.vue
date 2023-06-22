<script setup>
import { computed, ref } from 'vue';
import TempControls from './components/TempControls.vue';

const powerBtn = ref(false);

const powerBtnClass = computed(() => {
  return powerBtn.value ? 'kettle-panel__power-btn kettle-panel__power-btn--active' : 'kettle-panel__power-btn';
});
</script>

<template>
  <main class="kettle-panel">
    <TempControls />
    <button @click="powerBtn = !powerBtn" :class="powerBtnClass"></button>
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
  padding: 120px 30px 100px ;
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
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    width: 100%;
    padding: 60px 30px 80px ;
  }
}
</style>
