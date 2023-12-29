import dotenv from 'dotenv';

const REQUIRED_ENV_VARS = [
  'API_GATEWAY_PORT',
  'MONITOR_PORT',
  'MONITOR_NAME',
  'RABBITMQ_NAME',
  'RABBITMQ_USER',
  'RABBITMQ_PASS',
  'RABBITMQ_TOPIC_STATE_MONITOR',
  'RABBITMQ_TOPIC_STATE_SERVICE1',
  'RABBITMQ_TOPIC_STATE_SERVICE2'
] as const;

export const configureEnvVariables = () => {
  dotenv.config();
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable missing: ${envVar}`);
    }
  });
};

const envVariables = process.env;

export const API_GATEWAY_PORT = envVariables.API_GATEWAY_PORT;
export const MONITOR_PORT = envVariables.MONITOR_PORT;
export const MONITOR_NAME = envVariables.MONITOR_NAME;
export const MONITOR_URL = `http://${MONITOR_NAME}:${MONITOR_PORT}`;
export const RABBITMQ_NAME = envVariables.RABBITMQ_NAME;
export const RABBITMQ_USER = envVariables.RABBITMQ_USER;
export const RABBITMQ_PASS = envVariables.RABBITMQ_PASS;
export const RABBITMQ_PORT = envVariables.RABBITMQ_PORT;
export const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${
  envVariables.NODE_ENV == 'test' ? `localhost:${RABBITMQ_PORT}` : RABBITMQ_NAME
}`;
export const RABBITMQ_TOPIC_STATE_MONITOR =
  envVariables.RABBITMQ_TOPIC_STATE_MONITOR;
export const RABBITMQ_TOPIC_STATE_SERVICE1 =
  envVariables.RABBITMQ_TOPIC_STATE_SERVICE1;
export const RABBITMQ_TOPIC_STATE_SERVICE2 =
  envVariables.RABBITMQ_TOPIC_STATE_SERVICE2;
export const RABBITMQ_EXCHANGE = 'topic_state';
