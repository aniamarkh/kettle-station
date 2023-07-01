<script setup>
import { ref, onMounted } from 'vue';
import KettleStation from './components/KettleStation.vue';
import PasswordForm from './components/PasswordForm.vue';

const password = ref(null);

const onPasswordSubmitted = (submittedPassword) => {
  password.value = submittedPassword;
  localStorage.setItem('kettlepass', password.value);
};

onMounted(() => {
  const kettleValue = localStorage.getItem('kettlepass');
  if (kettleValue) {
    password.value = kettleValue;
  }
});
</script>

<template>
  <main>
    <PasswordForm v-if="!password" @submit-password="onPasswordSubmitted" />
    <KettleStation v-if="password" :password="password" />
  </main>
</template>

<style scoped></style>
