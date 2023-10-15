import dotenv from "dotenv";

const REQUIRED_ENV_VARS = [
  "SERVICE1_PORT",
  "SERVICE2_PORT",
  "SERVICE2_NAME",
  "RABBITMQ_NAME",
  "RABBITMQ_USER",
  "RABBITMQ_PASS",
  "RABBITMQ_TOPIC_MESSAGE",
  "RABBITMQ_TOPIC_LOG",
] as const;

export const configureEnvVariables = () => {
  dotenv.config();
  REQUIRED_ENV_VARS.forEach((envVar) => {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable missing: ${envVar}`);
    }
  });
};

const envVariables = process.env;

export const SERVICE1_PORT = envVariables.SERVICE1_PORT;
export const SERVICE2_PORT = envVariables.SERVICE2_PORT;
export const SERVICE2_NAME = envVariables.SERVICE2_NAME;
export const SERVICE2_URL = `http://${SERVICE2_NAME}:${SERVICE2_PORT}`;
export const RABBITMQ_NAME = envVariables.RABBITMQ_NAME;
export const RABBITMQ_USER = envVariables.RABBITMQ_USER;
export const RABBITMQ_PASS = envVariables.RABBITMQ_PASS;
export const RABBITMQ_URL = `amqp://${RABBITMQ_USER}:${RABBITMQ_PASS}@${RABBITMQ_NAME}`;
export const RABBITMQ_TOPIC_MESSAGE = envVariables.RABBITMQ_TOPIC_MESSAGE;
export const RABBITMQ_TOPIC_LOG = envVariables.RABBITMQ_TOPIC_LOG;
export const RABBITMQ_EXCHANGE = "topic_messages";
