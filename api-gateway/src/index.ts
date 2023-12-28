import express, { Express } from 'express';
import { type Channel } from 'amqplib';
import {
  API_GATEWAY_PORT,
  RABBITMQ_TOPIC_LOG,
  configureEnvVariables
} from './config/variables';
import { initializeAmqp } from './utils/utils';

const app: Express = express();
let channel: Channel | undefined;
// State and state-history is kept in memory
// state: State = State.Init;
const runLog: string[] = [];

app.get('/', (req, res) => {
  res.status(200).send();
});

/** Resets the state-history. Mainly used for testing. */
app.post('/reset', (req, res) => {
  runLog.splice(0, runLog.length);
  console.log('Resetting state-history');
  res.status(200).send();
});

void configureEnvVariables();

const server = app.listen(API_GATEWAY_PORT, async () => {
  console.log(`HTTP server running on port ${API_GATEWAY_PORT} 🔥`);

  channel = await initializeAmqp({
    queueNames: [RABBITMQ_TOPIC_LOG]
  });
  if (!channel) return;
});

const shutDownServer = async () => {
  console.log('Shutting down ✔️');
  await channel?.close();
  server.close();
  process.exit(0);
};

process.on('SIGTERM', shutDownServer);
process.on('SIGINT', shutDownServer);

export { server, shutDownServer };
