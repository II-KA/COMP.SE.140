import express, { Express } from 'express';
import { Server } from 'http';
import { getAddress, initializeAmqp } from './utils/utils';
import { messageLoop } from './messageLoop';
import {
  RABBITMQ_TOPIC_LOG,
  RABBITMQ_TOPIC_MESSAGE,
  SERVICE1_PORT,
  SERVICE2_NAME,
  SERVICE2_PORT,
  configureEnvVariables
} from './config/variables';

const app: Express = express();
let server: Server;

const startServer = async () =>
  (server = app.listen(SERVICE1_PORT, async () => {
    console.log(`HTTP server running on port ${SERVICE1_PORT} 🔥`);

    const channel = await initializeAmqp({
      queueNames: [RABBITMQ_TOPIC_MESSAGE, RABBITMQ_TOPIC_LOG]
    });
    if (!channel) return;
    const address = await getAddress({ serviceName: SERVICE2_NAME });
    if (!address) return;

    await messageLoop({ address: `${address}:${SERVICE2_PORT}`, channel });
  }));

const shutDownServer = async () => {
  console.log('Shutting down ✔️');
  server.close();
  process.exit(0);
};

void configureEnvVariables();
void startServer();

process.on('SIGTERM', shutDownServer);
process.on('SIGINT', shutDownServer);
