/* eslint-disable @typescript-eslint/no-explicit-any */
import CryptoJS from 'crypto-js';
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { PendingResponse, ReceivedMessage } from '../types';
import { STATUS_VALUE } from '../types';

export default class WebSocketManager {
  isAuthorized: Ref<null | boolean>;
  messageId: number;
  onIncorrectPassword: () => void;
  password: string;
  pendingResponses: Map<number, PendingResponse>;
  pingInterval: null | ReturnType<typeof setInterval>;
  retryCount: number;
  socket: null | WebSocket;
  status: Ref<STATUS_VALUE>;
  updateData: null | any;

  constructor(password: string, onIncorrectPassword: () => void) {
    this.isAuthorized = ref(null);
    this.messageId = 0;
    this.onIncorrectPassword = onIncorrectPassword;
    this.password = password;
    this.pendingResponses = new Map();
    this.pingInterval = null;
    this.retryCount = 0;
    this.socket = null;
    this.status = ref(STATUS_VALUE.UNINITIALIZED);
    this.updateData = null;
  }

  public registerUpdateData(func: any) {
    this.updateData = func;
  }

  public init() {
    this.updateStatus(STATUS_VALUE.CONNECTING);

    if (this.retryCount > 5) {
      console.error('💔 Failed to reconnect after several attempts.');
      this.updateStatus(STATUS_VALUE.CLOSED);
      return;
    }

    // this.socket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host);
    this.socket = new WebSocket('ws://localhost:8000/');

    this.socket.onopen = () => {
      this.retryCount = 0;
    };

    this.socket.onmessage = (event) => {
      try {
        const data: ReceivedMessage = JSON.parse(event.data);

        switch (data.t) {
          case 'challenge':
            this.handleAuthorization(data);
            break;
          case 'response':
            this.handleResponse(data);
            break;
          case 'status':
            this.updateData(data.d);
            break;
          default:
            console.error(`🧐 Unexpected message type: ${data.t}`);
            break;
        }
      } catch (error) {
        this.showError(`🤕 Error while processing message: ${error}`);
      }
    };

    this.socket.onclose = () => {
      this.pendingResponses.clear();
      this.messageId = 0;
      if (this.pingInterval) clearInterval(this.pingInterval);
      this.updateStatus(STATUS_VALUE.CLOSED);

      if (this.isAuthorized.value || this.isAuthorized.value === null) {
        setTimeout(this.init.bind(this), 2000 * ++this.retryCount);
      }
    };

    this.socket.onerror = () => {
      console.error('🤕 Websocket Error');
    };
  }

  public updateStatus(newStatus: STATUS_VALUE, delay: number | null = null) {
    this.status.value = newStatus;

    if (delay && this.status.value !== STATUS_VALUE.IDLE) {
      setTimeout(() => {
        this.status.value = STATUS_VALUE.IDLE;
      }, delay);
    }
  }

  public sendMessage(
    method: string,
    params: string | number | null,
    timeout: null | number = null
  ) {
    return new Promise((resolve, reject) => {
      this.socket?.send(JSON.stringify({ o: method, d: params, i: ++this.messageId }));
      this.pendingResponses.set(this.messageId, { resolve, reject });

      if (timeout) {
        const timer: ReturnType<typeof setTimeout> = setTimeout(() => {
          if (this.pendingResponses.has(this.messageId)) {
            this.pendingResponses.delete(this.messageId);
            reject(new Error(`🧐 Timeout after ${timeout} ms while calling method: '${method}'`));
          }
        }, timeout);

        const response = this.pendingResponses.get(this.messageId);
        if (response) response.timeout = timer;
      }
    });
  }

  public showError(errorMessage: string) {
    console.error(errorMessage);
    this.updateStatus(STATUS_VALUE.ERROR, 2000);
  }

  public close() {
    if (this.socket) this.socket.close();
  }

  private startPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      this.sendMessage('ping', null, 10000).catch(() => {
        this.showError('😴 No pong received: Restarting connection');
        this.close();
      });
    }, 30000);
  }

  private handleAuthorization(data: ReceivedMessage) {
    this.sendMessage(
      'challenge',
      CryptoJS.SHA256(this.password + data.d).toString(CryptoJS.enc.Hex)
    )
      .then(() => {
        this.updateStatus(STATUS_VALUE.CONNECTED, 2000);
        this.isAuthorized.value = true;
        this.startPing();
      })
      .catch(() => {
        this.isAuthorized.value = false;
        this.onIncorrectPassword();
        this.close();
      });
  }

  private handleResponse(data: ReceivedMessage) {
    const pendingResponse = this.pendingResponses.get(data.i);

    if (pendingResponse) {
      const { resolve, reject, timeout } = pendingResponse;

      if (timeout) clearTimeout(timeout);
      data.d ? resolve(data) : reject(data);
      this.pendingResponses.delete(data.i);
    } else {
      console.warn(`🧐 Unexpected response: no matching request for id ${data.i}`);
    }
  }
}
