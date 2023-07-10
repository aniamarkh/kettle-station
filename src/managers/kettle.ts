import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import WebSocketManager from './socket';
import type { LedData, ReceivedMessage } from '../types';
import { STATUS_VALUE, BUTTON_ID } from '../types';

export default class Kettle {
  connection: WebSocketManager;
  ledStatus: Ref<LedData>;

  constructor(connectionManager: WebSocketManager) {
    this.connection = connectionManager;
    this.ledStatus = ref({
      led_power: 0,
      led_70: 0,
      led_80: 0,
      led_90: 0,
      led_100: 0,
      led_keepwarm: 0,
    });

    this.updateLedStatus = this.updateLedStatus.bind(this);
    this.connection.registerUpdateData(this.updateLedStatus);
  }

  public isButtonsDisabled = computed(() => {
    const caseStatuses = [
      STATUS_VALUE.UNINITIALIZED,
      STATUS_VALUE.CLOSED,
      STATUS_VALUE.CONNECTING,
      STATUS_VALUE.WAITING,
    ];

    return caseStatuses.includes(this.connection.status.value);
  });

  public disableTempDown = computed(() => {
    return this.isButtonsDisabled.value || !this.ledStatus.value.led_70 ? true : false;
  });

  public disableTempUp = computed(() => {
    return this.isButtonsDisabled.value || this.ledStatus.value.led_100 ? true : false;
  });

  public isLedsOn = computed(() => {
    const caseStatuses = [STATUS_VALUE.UNINITIALIZED, STATUS_VALUE.CLOSED, STATUS_VALUE.CONNECTING];

    return !caseStatuses.includes(this.connection.status.value);
  });

  public init(): void {
    this.connection.init();
  }

  public updateLedStatus(ledData: LedData): void {
    this.ledStatus.value = ledData;
  }

  public pressButton(buttonId: BUTTON_ID) {
    this.connection.updateStatus(STATUS_VALUE.WAITING);
    this.connection
      .sendMessage('button_press', buttonId)
      .then(() => {
        this.connection.updateStatus(STATUS_VALUE.IDLE);
      })
      .catch((error: ReceivedMessage) => {
        this.connection.showError(`🤕 Error while handle button press: ${error.e}`);
      });
  }

  public disconnect() {
    this.connection.close();
  }
}
