<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue';
import CryptoJS from 'crypto-js';
import StatusMessage from './StatusMessage.vue';
import TempControls from './TempControls.vue';

const props = defineProps({
  password: String,
});
const emit = defineEmits(['on-incorrect-password']);

const isConnecting = ref(false);
const isConnected = ref(false);
const isWaitingForResponse = ref(false);
const isError = ref(false);
const isPasswordIncorrect = ref(false);

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
let pingInterval = null;


const sendMessage = (() => {
  let messageId = 0;
  return (message, timeout = null) => {
    messageId++;
    return new Promise((resolve, reject) => {
      socket.send(JSON.stringify({ ...message, i: messageId }));
      pendingResponses.set(messageId, { resolve, reject });

      if (timeout) {
        const timer = setTimeout(() => {
          if (pendingResponses.has(messageId)) {
            pendingResponses.delete(messageId);
            reject(new Error());
          }
        }, timeout);

        pendingResponses.get(messageId).timeout = timer;
      }
    });
  };
})();

const startPing = () => {
  if (pingInterval) {
    clearInterval(pingInterval);
  }

  pingInterval = setInterval(() => {
    sendMessage({ o: 'ping' }, 10000)
      .catch(() => {
        showError();
        socket.close();
        console.log('🧐 No pong received. Restarting connection.');
      });
  }, 30000);
};

const initializeWebSocket = () => {
  isConnected.value = false;
  isError.value = false;
  isConnecting.value = true;

  if (retryCount > 5) {
    console.error('💔 Failed to reconnect after several attempts.');
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
      }).then(() => {
        isPasswordIncorrect.value = false;
        isConnecting.value = false;
        isConnected.value = true;
        showConnected();
        startPing();
      }).catch(() => {
        isPasswordIncorrect.value = true;
        emit('on-incorrect-password');
        console.log('😐 Please enter correct password')
        socket.close();
      });
    }

    if (data.t === 'status') {
      ledData.value = data.d;
    }

    if (data.i && pendingResponses.has(data.i)) {
      const { resolve, reject, timeout } = pendingResponses.get(data.i);
      if (timeout) clearTimeout(timeout);

      switch (data.t) {
        case 'challenge_response':
          data.d ? resolve() : reject();
          break;
        case 'response':
          data.d === 'ok' ? resolve() : reject();
          break;
        case 'pong':
          resolve();
          break;
      }
      pendingResponses.delete(data.i);
    }

    if (data.e) {
      console.log(`🤕 Error Occurred: ${data.e}`);
      showError();
    };
  };

  socket.onclose = () => {
    clearInterval(pingInterval);
    if (!isPasswordIncorrect.value) {
      setTimeout(initializeWebSocket, 3000 * (++retryCount));
    }
  };

  socket.onerror = error => {
    showError();
    console.error(`WebSocket Error: ${error}`);
    socket.close();
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
    sendMessage({ o: 'button_press', d: btnId })
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
