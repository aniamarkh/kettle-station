/* eslint-disable no-unused-vars */
export interface LedData {
  led_power: 0 | 1;
  led_70: 0 | 1;
  led_80: 0 | 1;
  led_90: 0 | 1;
  led_100: 0 | 1;
  led_keepwarm: 0 | 1;
}

export enum BUTTON_ID {
  BTN_POWER = 0,
  BTN_TEMP_DOWN = 1,
  BTN_TEMP_UP = 2,
  BTN_KEEP_WARM = 3,
}

export enum STATUS_VALUE {
  UNINITIALIZED = 'uninitialized',
  CLOSED = 'closed',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  WAITING = 'waiting',
  ERROR = 'error',
  IDLE = 'idle',
}

export type PendingResponse = {
  resolve: (value: ReceivedMessage | string | number | undefined | null) => void;
  reject: (reason: ReceivedMessage | Error) => void;
  timeout?: ReturnType<typeof setTimeout>;
};

export type ReceivedMessage = {
  t: string;
  d?: string | number | null;
  e?: string;
  i: number;
};

export type SendMessage = {
  o: string;
  d: string | number | null;
  i: number;
};
