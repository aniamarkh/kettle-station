import { ref } from 'vue';

export default class StatusManager {
  constructor() {
    this.statusEnum = {
      CLOSED: 'closed',
      CONNECTING: 'connecting',
      CONNECTED: 'connected',
      AWAITING: 'awaiting',
      ERROR: 'error',
      IDLE: 'idle'
    };
    this.currentStatus = ref(null);
  }

  updateStatus(newStatus, delay = null) {
    this.currentStatus.value = newStatus;

    if (delay && this.currentStatus.value !== this.statusEnum.IDLE) {
      setTimeout(() => {
        this.currentStatus.value = this.statusEnum.IDLE;
      }, delay);
    }
  }
}