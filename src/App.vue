<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import type { Ref } from 'vue';
import KettleStation from './components/KettleStation.vue';
import PasswordForm from './components/PasswordForm.vue';

const password: Ref<string | null> = ref(null);
const isIncorrect: Ref<boolean> = ref(false);

const onPasswordSubmitted = (submittedPassword: string) => {
  password.value = submittedPassword;
  localStorage.setItem('kettlepass', password.value);
  isIncorrect.value = false;
};

const onIncorrectPassword = () => {
  localStorage.removeItem('kettlepass');
  console.log('😐 Please enter correct password');
  password.value = null;
  isIncorrect.value = true;
};

onBeforeMount(() => {
  const kettleValue = localStorage.getItem('kettlepass');
  if (kettleValue) {
    password.value = kettleValue;
  }
});
</script>

<template>
  <main>
    <Transition mode="out-in">
      <PasswordForm
        v-if="!password"
        @submit-password="onPasswordSubmitted"
        :is-incorrect="isIncorrect"
      />
      <KettleStation
        v-else-if="password"
        @on-incorrect-password="onIncorrectPassword"
        :password="password"
      />
    </Transition>
  </main>
</template>

<style scoped></style>
