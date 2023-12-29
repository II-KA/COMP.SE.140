declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_GATEWAY_PORT: string;
      MONITOR_PORT: string;
      MONITOR_NAME: string;
      RABBITMQ_NAME: string;
      RABBITMQ_USER: string;
      RABBITMQ_PASS: string;
      RABBITMQ_TOPIC_STATE_MONITOR: string;
      RABBITMQ_TOPIC_STATE_SERVICE1: string;
      RABBITMQ_TOPIC_STATE_SERVICE2: string;
    }
  }
}

export {};
