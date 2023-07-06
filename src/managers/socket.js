import CryptoJS from 'crypto-js';
import { ref } from 'vue';

export default class SocketManager {
  constructor(password, onIncorrectPassword, updateLedData) {
    this.socket = null;
    this.retryCount = 0;
    this.isConnecting = ref(true);
    this.isConnected = ref(false);
    this.isCorrectPassword = ref(true);
    this.isConnectedMessage = ref(false);
    this.isWaitingForResponse = ref(false);
    this.isError = ref(false);

    this.pingInterval = null;

    this.pendingResponses = new Map();
    this.messageId = 0;

    this.password = password;
    this.onIncorrectPassword = onIncorrectPassword;
    this.updateLedData = updateLedData;
  }
  
  onConnected() {
    this.isConnecting.value = false;
    this.isConnected.value = true;
    this.isConnectedMessage.value = true;

    setTimeout(() => {
      this.isConnectedMessage.value = false;
    }, 2000);

    this.startPing();
  }

  onError(errorMessage) {
    console.error(errorMessage);

    this.isError.value = true;
    setTimeout(() => {
      this.isError.value = false;
    }, 2000);
  }

  sendMessage(message, timeout = null) {
    this.messageId++;
    return new Promise((resolve, reject) => {
      this.socket.send(JSON.stringify({ ...message, i: this.messageId }));
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

  startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      this.sendMessage({ o: 'ping' }, 10000)
        .catch(() => {
          console.error('No pong received: Restarting connection');
          this.close();
        });
    }, 30000);
  }

  handleChallenge(data) {
    this.sendMessage({
      o: 'challenge',
      d: CryptoJS.SHA256(this.password + data.d).toString(CryptoJS.enc.Hex),
    }).then(() => this.onConnected())
      .catch(() => {
        this.isCorrectPassword.value = false;
        if (this.onIncorrectPassword) this.onIncorrectPassword();
        this.socket.close();
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
  
  onButtonPress(btnId) {
    if (this.isConnected.value) {
      this.isWaitingForResponse.value = true;
      this.sendMessage({ o: 'button_press', d: btnId })
        .catch((error) => {
          this.onError(`🤕 Error while handle button press: ${error}`);
        })
        .finally(() => {
          this.isWaitingForResponse.value = false;
        });
    }
  }

  initializeWebSocket() {
    this.isError.value = false;
    this.isConnecting.value = true;
    this.isConnected.value = false;
  
    if (this.retryCount > 5) {
      console.error('💔 Failed to reconnect after several attempts.');
      this.isConnecting.value = false;
      this.isError.value = true;
      return;
    }
  
    // socket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);
    this.socket = new WebSocket('ws://localhost:8000/');

    this.socket.onopen = () => {
      this.retryCount = 0;
    };
  
    this.socket.onmessage = event => {
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
      this.isConnected.value = false;
      clearInterval(this.pingInterval);
      if (this.isCorrectPassword.value) {
        setTimeout(this.initializeWebSocket.bind(this), 2000 * (++this.retryCount));
      }
    };
  
    this.socket.onerror = () => {
      this.onError('🤕 Websocket Error');
    };
  }

  close() {
    this.socket.close();
  }
}