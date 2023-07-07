import CryptoJS from 'crypto-js';
import { ref } from 'vue';

export default class SocketManager {
  constructor(password, onIncorrectPassword, updateLedData, statusManager) {
    this.socket = null;
    this.retryCount = 0;
    this.isAuthorized = ref(null);

    this.pingInterval = null;

    this.pendingResponses = new Map();
    this.messageId = 0;

    this.password = password;
    this.onIncorrectPassword = onIncorrectPassword;
    this.updateLedData = updateLedData;
    this.statusManager = statusManager;
  }

  initializeWebSocket() {
    this.statusManager.updateStatus(this.statusManager.statusEnum.CONNECTING);

    if (this.retryCount > 5) {
      console.error('💔 Failed to reconnect after several attempts.');
      this.statusManager.updateStatus(this.statusManager.statusEnum.CLOSED);
      return;
    }

    // socket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);
    this.socket = new WebSocket('ws://localhost:8000/');

    this.socket.onopen = () => {
      this.retryCount = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.t) {
          case 'challenge':
            this.handleChallenge(data);
            break;
          case 'response':
            this.handleResponse(data);
            break;
          case 'status':
            this.updateLedData(data.d);
            break;
          default:
            console.error(`🧐 Unexpected message type: ${data.t}`);
            break;
        }
      } catch (error) {
        this.onError(`🤕 Error while processing message: ${error}`);
      }
    };

    this.socket.onclose = () => {
      this.pendingResponses.clear();
      this.messageId = 0;
      clearInterval(this.pingInterval);
      this.updateLedData({
        led_power: 0,
        led_70: 0,
        led_80: 0,
        led_90: 0,
        led_100: 0,
        led_keepwarm: 0
      });

      this.statusManager.updateStatus(this.statusManager.statusEnum.CLOSED);
      if (this.isAuthorized.value || this.isAuthorized.value === null) {
        setTimeout(this.initializeWebSocket.bind(this), 2000 * ++this.retryCount);
      }
    };

    this.socket.onerror = () => {
      console.error('🤕 Websocket Error');
    };
  }

  handleChallenge(data) {
    this.sendMessage({
      o: 'challenge',
      d: CryptoJS.SHA256(this.password + data.d).toString(CryptoJS.enc.Hex)
    })
      .then(() => this.onConnected())
      .catch(() => {
        this.isAuthorized.value = false;
        if (this.onIncorrectPassword) this.onIncorrectPassword();
        this.close();
      });
  }

  onConnected() {
    this.statusManager.updateStatus(this.statusManager.statusEnum.CONNECTED, 2000);
    this.isAuthorized.value = true;
    this.startPing();
  }

  startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      this.sendMessage({ o: 'ping' }, 10000).catch(() => {
        this.onError('😴 No pong received: Restarting connection');
        this.close();
      });
    }, 30000);
  }

  sendMessage(message, timeout = null) {
    return new Promise((resolve, reject) => {
      this.socket.send(JSON.stringify({ ...message, i: ++this.messageId }));
      this.pendingResponses.set(this.messageId, { resolve, reject });

      if (timeout) {
        const timer = setTimeout(() => {
          if (this.pendingResponses.has(this.messageId)) {
            this.pendingResponses.delete(this.messageId);
            reject(new Error('Timeout'));
          }
        }, timeout);

        this.pendingResponses.get(this.messageId).timeout = timer;
      }
    });
  }

  handleResponse(data) {
    if (this.pendingResponses.has(data.i)) {
      const { resolve, reject, timeout } = this.pendingResponses.get(data.i);

      if (timeout) clearTimeout(timeout);
      data.d ? resolve(data.d) : reject(data.e);
      this.pendingResponses.delete(data.i);
    } else {
      console.warn(`🧐 Unexpected response: no matching request for id ${data.i}`);
    }
  }

  onButtonPress(buttonId) {
    this.statusManager.updateStatus(this.statusManager.statusEnum.AWAITING);
    this.sendMessage({ o: 'button_press', d: buttonId })
      .then(() => {
        this.statusManager.updateStatus(this.statusManager.statusEnum.IDLE);
      })
      .catch((error) => {
        this.onError(`🤕 Error while handle button press: ${error}`);
      });
  }

  onError(errorMessage) {
    console.error(errorMessage);
    this.statusManager.updateStatus(this.statusManager.statusEnum.ERROR, 2000);
  }

  close() {
    if (this.socket) this.socket.close();
  }
}
