<script setup>
import { ref, computed } from 'vue';

const password = ref('');
const isError = ref(false);
const emit = defineEmits(['submit-password']);

const inputClass = computed(() => {
  return isError.value ? 'password-form__input password-form__input--error' : 'password-form__input'
});

const onSubmit = () => {
  if (password.value.trim() === '') {
    isError.value = true;
  } else {
    isError.value = false;
    emit('submit-password', password.value);
  }
}
</script>

<template>
  <form class="password-form" @submit.prevent="onSubmit">
    <label class="password-form__label">Please enter the kettle password</label>
    <input :class="inputClass" type="password" placeholder="here" v-model="password" />
    <button class="password-form__btn">ok!</button>
  </form>
</template>

<style>
.password-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 350px;
}

.password-form__label {
  font-size: 16px;
  font-weight: bold;
}

.password-form__input {
  color: black;
  outline: none;
  border: none;
  padding: 10px;
  border-radius: 20px;
  font-size: 18px;
  width: 100%;
}

.password-form__input--error {
  background-color: red;
  color: white;
}

.password-form__btn {
  width: 110px;
  height: 50px;
}
</style>