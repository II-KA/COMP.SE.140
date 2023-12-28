import dotenv from 'dotenv';

const REQUIRED_ENV_VARS = [
  'MONITOR_PORT',
  'RABBITMQ_NAME',
  'RABBITMQ_USER',
  'RABBITMQ_PASS',
  'RABBITMQ_TOPIC_LOG'
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

export const MONITOR_PORT = envVariables.MONITOR_PORT;
export const RABBITMQ_NAME = envVariables.RABBITMQ_NAME;
export const RABBITMQ_USER = envVariables.RABBITMQ_USER;
export const RABBITMQ_PASS = envVariables.RABBITMQ_PASS;
export const RABBITMQ_PORT = envVariables.RABBITMQ_PORT;
export const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${
  envVariables.NODE_ENV == 'test' ? `localhost:${RABBITMQ_PORT}` : RABBITMQ_NAME
}`;
export const RABBITMQ_TOPIC_LOG = envVariables.RABBITMQ_TOPIC_LOG;
export const RABBITMQ_EXCHANGE = 'topic_log';
