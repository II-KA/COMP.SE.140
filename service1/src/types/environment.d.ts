declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SERVICE1_PORT: string;
      SERVICE2_PORT: string;
      SERVICE2_NAME: string;
      RABBITMQ_NAME: string;
      RABBITMQ_USER: string;
      RABBITMQ_PASS: string;
      RABBITMQ_TOPIC_MESSAGE: string;
      RABBITMQ_TOPIC_LOG: string;
    }
  }
}

export {};
