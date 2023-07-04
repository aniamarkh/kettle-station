<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';
import CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import StatusMessage from './StatusMessage.vue';
import TempControls from './TempControls.vue';

const props = defineProps({
  password: String,
});
const emit = defineEmits(['show-form']);

const isConnecting = ref(false);
const isConnected = ref(false);
const isWaitingForResponse = ref(false);
const isError = ref(false);

const ledData = ref({
  led_power: 0,
  led_70: 0,
  led_80: 0,
  led_90: 0,
  led_100: 0,
  led_keepwarm: 0
});

let socket;
let retryCount = 0;
const pendingResponses = new Map();

const sendMessage = (message) => {
  return new Promise((resolve, reject) => {
    socket.send(JSON.stringify(message));
    pendingResponses.set(message.i, { resolve, reject });
  });
};

const initializeWebSocket = () => {
  isConnecting.value = true;

  if (retryCount > 5) {
    showError();
    console.error('Failed to reconnect after several attempts.');
    isConnecting.value = false;
    isError.value = true;
    return;
  }

  // socket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);
  socket = new WebSocket('ws://localhost:8000/');

  socket.onopen = () => {
    retryCount = 0;
  };

  socket.onmessage = event => {
    const data = JSON.parse(event.data);

    if (data.t === 'challenge') {
      sendMessage({
        o: 'challenge',
        d: CryptoJS.SHA256(props.password + data.d).toString(CryptoJS.enc.Hex),
        i: uuidv4(),
      }).then(() => {
        isConnecting.value = false;
        isConnected.value = true;
        showConnected();
      }).catch(() => {
        emit('show-form');
        socket.close();
      });
    }

    if (data.i && pendingResponses.has(data.i)) {
      const { resolve, reject } = pendingResponses.get(data.i);

      switch (data.t) {
        case 'challenge_response':
          if (data.d) resolve(data);
          else reject(new Error('Bad response: Incorrect password!'));
          break;
        case 'response':
          if (data.d === 'ok') resolve(data);
          else reject(new Error(`Bad response: ${data.d}`));
          break;
      }

      pendingResponses.delete(data.i);
    } else if (data.t === 'status') {
      ledData.value = data.d;
    }

    if (data.e) {
      console.log(`Error Occurred: ${data.e}`);
      showError();
    };
  };

  socket.onclose = () => {
    isConnected.value = false;
  };

  socket.onerror = error => {
    showError();
    console.error(`WebSocket Error: ${error}`);
    socket.close();
    setTimeout(initializeWebSocket, 3000 * (++retryCount));
  };
};

onMounted(initializeWebSocket);

onUnmounted(() => {
  if (socket) {
    socket.close();
  }
});

const powerBtnClass = computed(() => {
  return ledData.value.led_power && isConnected.value ? 'kettle-panel__power-btn kettle-panel__power-btn--active' : 'kettle-panel__power-btn';
});

const disableBtns = computed(() => {
  return !isConnected.value || isWaitingForResponse.value || isConnecting.value;
});

const toggleBtn = (btnId) => {
  if (isConnected.value) {
    isWaitingForResponse.value = true;
    sendMessage({ o: 'button_press', d: btnId, i: uuidv4() })
      .catch(() => {
        showError();
      })
      .finally(() => {
        isWaitingForResponse.value = false;
      });
  }
};

const showError = () => {
  isError.value = true;
  setTimeout(() => {
    isError.value = false;
  }, 2000);
};

const isConnectedMessage = ref(false);
const showConnected = () => {
  isConnectedMessage.value = true;
  setTimeout(() => {
    isConnectedMessage.value = false;
  }, 2000);
};
</script>

<template>
  <div class="kettle-panel">
    <StatusMessage :is-connected-message="isConnectedMessage" :is-connecting="isConnecting" :is-error="isError" />
    <TempControls :is-connected="isConnected" :is-waiting-for-response="isWaitingForResponse" :led-data="ledData"
      :disable-btns="disableBtns" @toggle-btn="toggleBtn" />
    <button @click="toggleBtn(0)" :class="powerBtnClass" :disabled="disableBtns"></button>
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
