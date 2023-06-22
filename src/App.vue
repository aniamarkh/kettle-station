<script setup>
import { computed, ref } from 'vue';
import TempControls from './components/TempControls.vue';

const powerBtn = ref(false);
const warmBtn = ref(false);

const powerBtnClass = computed(() => {
  return powerBtn.value ? 'teapot-panel__power-btn teapot-panel__power-btn--active' : 'teapot-panel__power-btn';
});
const warmBtnClass = computed(() => {
  return warmBtn.value ? 'teapot-panel__warm-btn teapot-panel__warm-btn--active' : 'teapot-panel__warm-btn';
})

</script>

<template>
  <main class="teapot-panel">
    <div class="panel__controls">
      <TempControls />
      <button @click="warmBtn = !warmBtn" :class="warmBtnClass">keep warm</button>
    </div>
    <button @click="powerBtn = !powerBtn" :class="powerBtnClass">
    </button>

  </main>
</template>

<style scoped>
.teapot-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 120px 30px 100px ;
}

.panel__controls {
  display: flex;
  flex-direction: column;
  gap: 60px;
  align-items: center;
  justify-content: flex-start;
  height: calc(100% - 150px);
}

.teapot-panel__power-btn {
  width: 150px;
  height: 150px;
  border-radius: 100%;
  background-image: url(assets/power-off.svg);
  background-repeat: no-repeat;
  background-position: 50%;
  background-size: 80px;
}


.teapot-panel__power-btn:disabled {
  background-color: #ffffff1a;
  
}
/* .teapot-panel__power-btn:hover {
  transform: scale(1.02);
} */

.teapot-panel__power-btn--active {
  box-shadow: 0px 0px 30px 15px #ffffffef;
  background-image: url(assets/power-on.svg);
}

.teapot-panel__warm-btn {
  font-size: 26px;
  font-weight: bold;
  padding: 20px;
  width: 230px;
}

.teapot-panel__warm-btn--active {
  box-shadow: 0px 0px 20px 10px #ffffffef;
  color: #ffffff;
}

.teapot-panel__warm-btn:disabled {
  background-color: #ffffff1a;
  color: #ffffff1a;
}
</style>
