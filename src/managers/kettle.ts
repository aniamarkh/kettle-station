import { ref } from 'vue';

export default class Kettle {
  BTN_POWER = 0
  BTN_TEMP_DOWN = 1
  BTN_TEMP_UP = 2
  BTN_KEEP_WARM = 3

  constructor(connectionManager) {
    this.connection = connectionManager;
    this.ledStatus = ref({
      led_power: 0,
      led_70: 0,
      led_80: 0,
      led_90: 0,
      led_100: 0,
      led_keepwarm: 0
    });

    this.connection.registerUpdateData(this.updateLedStatus);
  }

  init() {
    this.connection.init();
  }

  updateLedStatus(ledData) {
    this.ledStatus.value = ledData;
  }

  pressButton(buttonId) {
    this.connection.sendMessage('button_press', buttonId)
// Как статус-то дрочить??? блокать кнопки и разблокать
      .then(() => {
        
      })
  }
}


