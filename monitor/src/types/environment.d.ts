declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONITOR_PORT: string;
      RABBITMQ_NAME: string;
      RABBITMQ_USER: string;
      RABBITMQ_PASS: string;
      RABBITMQ_TOPIC_LOG: string;
    }
  }
}

export {};
